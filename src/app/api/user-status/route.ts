// src/app/api/user-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await (clerkClient).users.getUser(userId);

    // Be defensive about shapes coming back from Clerk
    const publicMeta = (user.publicMetadata ?? {}) as Record<string, unknown>;
    const isPro = Boolean(publicMeta.isPro);

    return new NextResponse(
      JSON.stringify({ isPro }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
          // prevent caching so the flag flips immediately after webhook
          "cache-control": "no-store",
        },
      }
    );
  } catch (err: any) {
    console.error("❌ /api/user-status failed:", err?.message || err);
    return NextResponse.json(
      { error: "Failed to load user status" },
      { status: 500 }
    );
  }
}
