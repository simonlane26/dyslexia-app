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
      return NextResponse.json({ error: `Query failed: ${membersRes.error.message}` }, { status: 500 });
    }
    members = membersRes.data;
  } catch (e) {
    return NextResponse.json({ error: `Supabase query failed: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
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

    return {
      memberId: s.memberId,
      displayName: s.displayName,
      sessionCount: s.sessionCount,
      totalWords: s.totalWords,
      avgSentenceLength: avgSentLen,
      badges,
    };
  });

  return NextResponse.json({
    students,
    schoolId,
    schoolName: school?.name ?? "My School",
    schoolCode: meta.schoolCode ?? null,
  });
}
