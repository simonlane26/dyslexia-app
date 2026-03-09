import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

const SCHOOL_PLANS = ["school_starter", "school_mid", "school_full"];

async function verifyUser(userId: string) {
  const clerkKey = process.env.CLERK_SECRET_KEY!;
  const userRes = await fetch(
    `https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`,
    { headers: { Authorization: `Bearer ${clerkKey}` } }
  );
  if (!userRes.ok) return null;
  const userData = await userRes.json();
  return userData.public_metadata ?? {};
}

// GET: fetch active assignment for the user's school (teachers + students)
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const meta = await verifyUser(userId);
  if (!meta || !SCHOOL_PLANS.includes(meta.plan) || !meta.schoolId) {
    return NextResponse.json({ assignment: null });
  }

  const db = createSupabaseServerClient();
  const { data: assignment } = await db
    .from("assignments")
    .select("id, title, description, min_words, due_date, created_at")
    .eq("school_id", meta.schoolId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // For students: also fetch their feedback for this assignment
  let feedback: string | null = null;
  if (assignment && meta.schoolRole !== "teacher") {
    const { data: member } = await db
      .from("school_members")
      .select("id")
      .eq("clerk_user_id", userId)
      .eq("school_id", meta.schoolId)
      .single();

    if (member) {
      const { data: fb } = await db
        .from("assignment_feedback")
        .select("comment")
        .eq("school_id", meta.schoolId)
        .eq("student_member_id", member.id)
        .eq("assignment_id", assignment.id)
        .maybeSingle();
      feedback = fb?.comment ?? null;
    }
  }

  return NextResponse.json({ assignment: assignment ?? null, feedback });
}

// POST: create a new assignment (teachers only)
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const meta = await verifyUser(userId);
  if (!meta || !SCHOOL_PLANS.includes(meta.plan) || meta.schoolRole !== "teacher") {
    return NextResponse.json({ error: "Teachers only" }, { status: 403 });
  }
  if (!meta.schoolId) return NextResponse.json({ error: "No school linked" }, { status: 403 });

  let body: any = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, description, min_words, due_date } = body;
  if (!title?.trim()) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const db = createSupabaseServerClient();

  // Deactivate any existing active assignments first
  await db.from("assignments").update({ is_active: false })
    .eq("school_id", meta.schoolId).eq("is_active", true);

  // Look up teacher's member record for created_by
  const { data: member } = await db
    .from("school_members")
    .select("id")
    .eq("clerk_user_id", userId)
    .eq("school_id", meta.schoolId)
    .single();

  const { data, error } = await db.from("assignments").insert({
    school_id: meta.schoolId,
    title: title.trim(),
    description: description?.trim() || null,
    min_words: typeof min_words === "number" && min_words > 0 ? Math.floor(min_words) : 0,
    due_date: due_date || null,
    created_by: member?.id || null,
    is_active: true,
  }).select("id, title, description, min_words, due_date, created_at").single();

  if (error) {
    console.error("[assignments] insert error:", error);
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }

  return NextResponse.json({ assignment: data });
}

// DELETE: deactivate current assignment (teachers only)
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const meta = await verifyUser(userId);
  if (!meta || !SCHOOL_PLANS.includes(meta.plan) || meta.schoolRole !== "teacher") {
    return NextResponse.json({ error: "Teachers only" }, { status: 403 });
  }
  if (!meta.schoolId) return NextResponse.json({ error: "No school linked" }, { status: 403 });

  const db = createSupabaseServerClient();
  await db.from("assignments").update({ is_active: false })
    .eq("school_id", meta.schoolId).eq("is_active", true);

  return NextResponse.json({ ok: true });
}
