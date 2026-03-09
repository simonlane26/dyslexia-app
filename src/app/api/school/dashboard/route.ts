import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

const SCHOOL_PLANS = ["school_starter", "school_mid", "school_full"];

export async function GET(req: NextRequest) {
  void req;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify teacher role via Clerk
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

  if (!SCHOOL_PLANS.includes(meta.plan) || meta.schoolRole !== "teacher") {
    return NextResponse.json({ error: "Teachers only" }, { status: 403 });
  }
  if (!meta.schoolId) {
    return NextResponse.json({ error: "No school linked" }, { status: 403 });
  }

  let db;
  try {
    db = createSupabaseServerClient();
  } catch (e) {
    return NextResponse.json({ error: `Supabase init failed: ${e instanceof Error ? e.message : String(e)}` }, { status: 503 });
  }

  const schoolId: string = meta.schoolId;

  // Fetch school info
  let school = null;
  let members: { id: string; display_name: string | null; role: string; joined_at: string }[] | null = null;

  try {
    const schoolRes = await db
      .from("schools")
      .select("name, school_code, plan_tier, max_students")
      .eq("id", schoolId)
      .maybeSingle();
    school = schoolRes.data;

    const membersRes = await db
      .from("school_members")
      .select("id, display_name, role, joined_at")
      .eq("school_id", schoolId)
      .eq("role", "student");

    if (membersRes.error) {
      console.error("[school/dashboard] members query error:", membersRes.error);
      return NextResponse.json({ error: "Failed to load dashboard", detail: membersRes.error.message }, { status: 500 });
    }
    members = membersRes.data;
  } catch (e) {
    console.error("[school/dashboard] unexpected error:", e);
    return NextResponse.json({ error: "Failed to load dashboard", detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }

  if (!members?.length) {
    return NextResponse.json({
      students: [],
      schoolId,
      schoolName: school?.name ?? "My School",
      schoolCode: meta.schoolCode ?? null,
    });
  }

  const memberIds = members.map((m) => m.id);

  // Get sessions from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: sessions } = await db
    .from("writing_sessions")
    .select("member_id, words_typed, simplifications_used, avg_sentence_length, session_date")
    .eq("school_id", schoolId)
    .in("member_id", memberIds)
    .gte("session_date", thirtyDaysAgo.toISOString().slice(0, 10));

  // Fetch active assignment (if any)
  const { data: activeAssignment } = await db
    .from("assignments")
    .select("id, title, description, min_words, due_date, created_at")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch sessions since assignment was created (for completion status)
  let assignmentSessions: { member_id: string; words_typed: number }[] = [];
  if (activeAssignment) {
    const { data: aSessions } = await db
      .from("writing_sessions")
      .select("member_id, words_typed")
      .eq("school_id", schoolId)
      .in("member_id", memberIds)
      .gte("session_date", activeAssignment.created_at.slice(0, 10));
    assignmentSessions = aSessions ?? [];
  }

  // Aggregate per student
  type StudentAgg = {
    memberId: string;
    displayName: string;
    joinedAt: string;
    sessionCount: number;
    totalWords: number;
    totalSimplifications: number;
    sentenceLengthSum: number;
    sentenceLengthSamples: number;
  };

  const studentMap = new Map<string, StudentAgg>(
    members.map((m) => [
      m.id,
      {
        memberId: m.id,
        displayName: m.display_name ?? "Student",
        joinedAt: m.joined_at,
        sessionCount: 0,
        totalWords: 0,
        totalSimplifications: 0,
        sentenceLengthSum: 0,
        sentenceLengthSamples: 0,
      },
    ])
  );

  for (const s of sessions ?? []) {
    const student = studentMap.get(s.member_id);
    if (!student) continue;
    student.sessionCount += 1;
    student.totalWords += s.words_typed ?? 0;
    student.totalSimplifications += s.simplifications_used ?? 0;
    if (typeof s.avg_sentence_length === "number") {
      student.sentenceLengthSum += s.avg_sentence_length;
      student.sentenceLengthSamples += 1;
    }
  }

  // Fetch feedback for all students on the active assignment
  const feedbackMap = new Map<string, string>();
  if (activeAssignment) {
    const { data: feedbackRows } = await db
      .from("assignment_feedback")
      .select("student_member_id, comment")
      .eq("school_id", schoolId)
      .eq("assignment_id", activeAssignment.id)
      .in("student_member_id", memberIds);
    for (const row of feedbackRows ?? []) {
      feedbackMap.set(row.student_member_id, row.comment);
    }
  }

  // Aggregate assignment words per student
  const assignmentWordMap = new Map<string, number>();
  for (const s of assignmentSessions) {
    assignmentWordMap.set(s.member_id, (assignmentWordMap.get(s.member_id) ?? 0) + (s.words_typed ?? 0));
  }

  const students = Array.from(studentMap.values()).map((s) => {
    const avgSentLen =
      s.sentenceLengthSamples > 0
        ? Math.round((s.sentenceLengthSum / s.sentenceLengthSamples) * 10) / 10
        : null;
    const simplificationRate =
      s.sessionCount > 0 ? s.totalSimplifications / s.sessionCount : 0;

    const badges: string[] = [];
    if (s.sessionCount >= 3) badges.push("Regular Writer");
    if (avgSentLen !== null && avgSentLen <= 12) badges.push("Clearer Sentences");
    if (simplificationRate >= 1) badges.push("Writing Confidence Improving");
    if (s.totalWords >= 500) badges.push("Easier to Read");

    const assignmentWords = assignmentWordMap.get(s.memberId) ?? 0;
    const minWords = activeAssignment?.min_words ?? 0;
    let assignmentStatus: "completed" | "in_progress" | "not_started" = "not_started";
    if (activeAssignment) {
      if (minWords > 0 && assignmentWords >= minWords) assignmentStatus = "completed";
      else if (assignmentWords > 0) assignmentStatus = "in_progress";
    }

    return {
      memberId: s.memberId,
      displayName: s.displayName,
      sessionCount: s.sessionCount,
      totalWords: s.totalWords,
      avgSentenceLength: avgSentLen,
      badges,
      assignmentStatus,
      assignmentWords,
      teacherFeedback: feedbackMap.get(s.memberId) ?? null,
    };
  });

  return NextResponse.json({
    students,
    schoolId,
    schoolName: school?.name ?? "My School",
    schoolCode: meta.schoolCode ?? null,
    activeAssignment: activeAssignment ?? null,
  });
}
