import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

const CODE_FORMAT = /^DW-AS-[A-Z0-9]{8}$/;

async function clerkPatchUserMetadata(
  userId: string,
  publicData: Record<string, unknown>
) {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) throw new Error("Missing CLERK_SECRET_KEY");

  const res = await fetch(
    `https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_metadata: publicData }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Clerk PATCH failed: ${res.status} ${text}`);
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = (body.code ?? "").toUpperCase().trim();
  if (!CODE_FORMAT.test(code)) {
    return NextResponse.json(
      { error: "That doesn't look like a valid AppSumo code. Check for typos and try again." },
      { status: 400 }
    );
  }

  const db = createSupabaseServerClient();

  // Atomic claim: only succeeds if the code is still unused. Avoids a
  // race where two requests redeem the same code simultaneously.
  const { data: claimed, error: claimErr } = await db
    .from("appsumo_codes")
    .update({
      status: "redeemed",
      clerk_user_id: userId,
      redeemed_at: new Date().toISOString(),
    })
    .eq("code", code)
    .eq("status", "unused")
    .select()
    .maybeSingle();

  if (claimErr) {
    console.error("[appsumo/redeem] claim error:", claimErr);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  if (!claimed) {
    // The atomic claim didn't match — figure out why for a useful message.
    const { data: existing } = await db
      .from("appsumo_codes")
      .select("status, clerk_user_id")
      .eq("code", code)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Invalid code. Check for typos and try again." }, { status: 404 });
    }
    if (existing.clerk_user_id === userId) {
      // Already redeemed by this same user — treat as idempotent success
      // rather than an error (e.g. they double-clicked, or refreshed).
      return NextResponse.json({ ok: true, alreadyRedeemed: true });
    }
    return NextResponse.json(
      { error: "This code has already been used." },
      { status: 409 }
    );
  }

  // Fetch current Clerk metadata so we don't overwrite unrelated fields
  const clerkKey = process.env.CLERK_SECRET_KEY!;
  const userRes = await fetch(
    `https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`,
    { headers: { Authorization: `Bearer ${clerkKey}` } }
  );
  const userData = userRes.ok ? await userRes.json() : {};
  const existingMeta = userData.public_metadata ?? {};

  try {
    await clerkPatchUserMetadata(userId, {
      ...existingMeta,
      isPro: true,
      plan: "appsumo_ltd",
      appsumoCode: code,
      appsumoRedeemedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[appsumo/redeem] Clerk metadata patch failed:", err);
    // The code is already claimed in the DB at this point — roll back
    // so the user (or support) can retry rather than losing the code.
    await db
      .from("appsumo_codes")
      .update({ status: "unused", clerk_user_id: null, redeemed_at: null })
      .eq("code", code);
    return NextResponse.json(
      { error: "Something went wrong activating your account. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
