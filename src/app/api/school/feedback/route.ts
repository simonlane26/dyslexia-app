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

// POST: upsert feedback for a student on the current assignment (teachers only)
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

  const { student_member_id, assignment_id, comment } = body;
  if (!student_member_id || !assignment_id) {
    return NextResponse.json({ error: "student_member_id and assignment_id are required" }, { status: 400 });
  }

  const db = createSupabaseServerClient();

  // Upsert — one comment per student per assignment
  const { error } = await db.from("assignment_feedback").upsert(
    {
      school_id: meta.schoolId,
      student_member_id,
      assignment_id,
      comment: comment?.trim() ?? "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "school_id,student_member_id,assignment_id" }
  );

  if (error) {
    console.error("[feedback] upsert error:", error);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
