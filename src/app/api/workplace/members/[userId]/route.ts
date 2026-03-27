import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WORKPLACE_PLANS = ['workplace_starter', 'workplace_business', 'workplace_enterprise'];

async function getClerkUser(userId: string) {
  const res = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  });
  if (!res.ok) return null;
  return res.json();
}

async function revokeClerkWorkplace(clerkUserId: string) {
  const userRes = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  });
  const userData = userRes.ok ? await userRes.json() : {};
  const existing = userData.public_metadata ?? {};

  await fetch(`https://api.clerk.com/v1/users/${clerkUserId}/metadata`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      public_metadata: {
        ...existing,
        isPro: false,
        plan: null,
        workplaceId: null,
        workplaceRole: null,
      },
    }),
  });
}

// DELETE /api/workplace/members/[userId] — remove a member by their DB row id
export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  void req;
  const { userId: adminId } = await auth();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = await getClerkUser(adminId);
  if (!admin) return NextResponse.json({ error: 'Could not verify user' }, { status: 500 });

  const meta = admin.public_metadata ?? {};
  if (!WORKPLACE_PLANS.includes(meta.plan) || meta.workplaceRole !== 'admin') {
    return NextResponse.json({ error: 'Workspace admins only' }, { status: 403 });
  }

  const db = createSupabaseServerClient();
  const workplaceId: string = meta.workplaceId;

  // Fetch the member row to get their clerk_user_id
  const { data: member } = await db
    .from('workplace_members')
    .select('id, clerk_user_id, role')
    .eq('id', params.userId)
    .eq('workplace_id', workplaceId)
    .maybeSingle();

  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  if (member.role === 'admin') return NextResponse.json({ error: 'Cannot remove the workspace admin' }, { status: 400 });

  // Soft-delete
  await db
    .from('workplace_members')
    .update({ is_active: false })
    .eq('id', member.id);

  // Revoke Clerk Pro access if they have an account
  if (member.clerk_user_id) {
    await revokeClerkWorkplace(member.clerk_user_id);
  }

  return NextResponse.json({ ok: true });
}
