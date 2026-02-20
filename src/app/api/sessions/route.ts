import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

const SCHOOL_PLANS = ["school_starter", "school_mid", "school_full"];

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch Clerk user to verify school membership
  const clerkKey = process.env.CLERK_SECRET_KEY!;
  const userRes = await fetch(
    `https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`,
    { headers: { Authorization: `Bearer ${clerkKey}` } }
  );
  if (!userRes.ok) {
    return NextResponse.json({ error: "Could not verify user" }, { status: 500 });
  }
  const userData = await userRes.json();
  const meta = userData.public_metadata ?? {};

  if (!SCHOOL_PLANS.includes(meta.plan)) {
    return NextResponse.json({ error: "Not a school user" }, { status: 403 });
  }
  if (!meta.schoolId) {
    return NextResponse.json({ error: "No school linked yet" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { words_typed, simplifications_used, avg_sentence_length, session_duration_minutes } = body as {
    words_typed?: number;
    simplifications_used?: number;
    avg_sentence_length?: number;
    session_duration_minutes?: number;
  };

  if (typeof words_typed !== "number" || words_typed < 0 || words_typed > 100_000) {
    return NextResponse.json({ error: "Invalid words_typed" }, { status: 400 });
  }

  const db = createSupabaseServerClient();

  // Look up school_member record
  const { data: member } = await db
    .from("school_members")
    .select("id, school_id")
    .eq("clerk_user_id", userId)
    .eq("school_id", meta.schoolId)
    .single();

  if (!member) {
    return NextResponse.json({ error: "School member record not found" }, { status: 404 });
  }

  const { error } = await db.from("writing_sessions").insert({
    school_id: member.school_id,
    member_id: member.id,
    session_date: new Date().toISOString().slice(0, 10),
    words_typed: Math.floor(words_typed),
    simplifications_used: Math.max(0, Math.floor((simplifications_used as number) ?? 0)),
    avg_sentence_length: typeof avg_sentence_length === "number" ? avg_sentence_length : null,
    session_duration_minutes:
      typeof session_duration_minutes === "number" ? Math.floor(session_duration_minutes) : null,
  });

  if (error) {
    console.error("[sessions] insert error:", error);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
