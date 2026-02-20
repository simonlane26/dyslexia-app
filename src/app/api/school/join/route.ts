import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

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

  let body: { school_code?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { school_code, role } = body;
  if (!school_code || !["teacher", "student"].includes(role ?? "")) {
    return NextResponse.json(
      { error: "school_code and role (teacher|student) are required" },
      { status: 400 }
    );
  }

  const db = createSupabaseServerClient();

  // Look up school by code
  const { data: school, error: schoolErr } = await db
    .from("schools")
    .select("id, name, plan_tier, max_students, expires_at")
    .eq("school_code", school_code.toUpperCase().trim())
    .single();

  if (schoolErr || !school) {
    return NextResponse.json(
      { error: "School code not found. Check the code with your teacher." },
      { status: 404 }
    );
  }

  // Check school not expired
  if (school.expires_at && new Date(school.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This school's subscription has expired." },
      { status: 403 }
    );
  }

  // Check student capacity (teachers don't count toward limit)
  if (role === "student") {
    const { count } = await db
      .from("school_members")
      .select("id", { count: "exact", head: true })
      .eq("school_id", school.id)
      .eq("role", "student");

    if ((count ?? 0) >= school.max_students) {
      return NextResponse.json(
        { error: "This school is at full capacity. Contact your teacher." },
        { status: 403 }
      );
    }
  }

  // Upsert member record
  const { error: memberErr } = await db.from("school_members").upsert(
    { school_id: school.id, clerk_user_id: userId, role },
    { onConflict: "school_id,clerk_user_id" }
  );

  if (memberErr) {
    console.error("[school/join] upsert error:", memberErr);
    return NextResponse.json(
      { error: "Failed to join school. Please try again." },
      { status: 500 }
    );
  }

  // Map tier back to full plan string
  const planMap: Record<string, string> = {
    starter: "school_starter",
    mid: "school_mid",
    full: "school_full",
  };

  // Fetch current Clerk metadata so we don't overwrite unrelated fields
  const clerkKey = process.env.CLERK_SECRET_KEY!;
  const userRes = await fetch(
    `https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`,
    { headers: { Authorization: `Bearer ${clerkKey}` } }
  );
  const userData = userRes.ok ? await userRes.json() : {};
  const existing = userData.public_metadata ?? {};

  await clerkPatchUserMetadata(userId, {
    ...existing,
    isPro: true,
    plan: planMap[school.plan_tier] ?? "school_starter",
    schoolId: school.id,
    schoolRole: role,
  });

  return NextResponse.json({ ok: true, schoolName: school.name, role });
}
