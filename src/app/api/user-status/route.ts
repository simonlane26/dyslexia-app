import "server-only";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // clerkClient is an async function in your setup — call and await it
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const publicMeta = (user.publicMetadata ?? {}) as Record<string, unknown>;
    const unsafeMeta = (user.unsafeMetadata ?? {}) as Record<string, unknown>;

    const isPro =
      publicMeta["isPro"] === true ||
      (unsafeMeta as any)?.isPro === true;

    return NextResponse.json({
      userId,
      isPro,
      publicMetadata: publicMeta,
    });
  } catch (err: any) {
    console.error("user-status error:", err?.message || err);
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
}
