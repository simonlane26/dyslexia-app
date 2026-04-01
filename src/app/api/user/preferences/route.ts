export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { userType, priorityFeatures, onboardingCompleted } = body;

  try {
    // Merge into existing publicMetadata via Clerk Admin API
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });
    const clerkUser = clerkRes.ok ? await clerkRes.json() : null;
    const existing = clerkUser?.public_metadata ?? {};

    await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}/metadata`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_metadata: {
          ...existing,
          ...(userType !== undefined && { userType }),
          ...(priorityFeatures !== undefined && { priorityFeatures }),
          ...(onboardingCompleted !== undefined && { onboardingCompleted }),
        },
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to save preferences:', err);
    // Return success anyway — localStorage already saved client-side
    return NextResponse.json({ success: true });
  }
}
