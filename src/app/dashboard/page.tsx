import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Class Dashboard | Dyslexia Writer",
  description: "Teacher view of student writing progress.",
};

const SCHOOL_PLANS = ["school_starter", "school_mid", "school_full"];

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Fetch Clerk user server-side to guard access
  const clerkKey = process.env.CLERK_SECRET_KEY!;
  const userRes = await fetch(
    `https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`,
    { headers: { Authorization: `Bearer ${clerkKey}` }, cache: "no-store" }
  );

  if (!userRes.ok) redirect("/app");

  const userData = await userRes.json();
  const meta = userData.public_metadata ?? {};

  if (!SCHOOL_PLANS.includes(meta.plan) || meta.schoolRole !== "teacher") {
    redirect("/app");
  }

  return <TeacherDashboard />;
}
