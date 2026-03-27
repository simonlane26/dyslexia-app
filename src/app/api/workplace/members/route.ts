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

async function findClerkUserByEmail(email: string) {
  const res = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}&limit=1`,
    { headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` } }
  );
  if (!res.ok) return null;
  const list = await res.json();
  return Array.isArray(list) && list.length > 0 ? list[0] : null;
}

async function patchClerkMeta(clerkUserId: string, meta: Record<string, unknown>) {
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
    body: JSON.stringify({ public_metadata: { ...existing, ...meta } }),
  });
}

// POST /api/workplace/members — invite a user by email
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = await getClerkUser(userId);
  if (!admin) return NextResponse.json({ error: 'Could not verify user' }, { status: 500 });

  const meta = admin.public_metadata ?? {};
  if (!WORKPLACE_PLANS.includes(meta.plan) || meta.workplaceRole !== 'admin') {
    return NextResponse.json({ error: 'Workspace admins only' }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const db = createSupabaseServerClient();
  const workplaceId: string = meta.workplaceId;

  // Check licence limit
  const { data: workplace } = await db
    .from('workplaces')
    .select('max_users, plan')
    .eq('id', workplaceId)
    .maybeSingle();

  const { count } = await db
    .from('workplace_members')
    .select('id', { count: 'exact', head: true })
    .eq('workplace_id', workplaceId)
    .eq('is_active', true);

  if (workplace && (count ?? 0) >= workplace.max_users) {
    return NextResponse.json({ error: 'Licence limit reached. Upgrade your plan to add more users.' }, { status: 403 });
  }

  // Check not already a member
  const { data: existing } = await db
    .from('workplace_members')
    .select('id, is_active')
    .eq('workplace_id', workplaceId)
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (existing?.is_active) {
    return NextResponse.json({ error: 'This email is already an active member.' }, { status: 409 });
  }

  // Look up if they already have a Clerk account
  const targetUser = await findClerkUserByEmail(email.toLowerCase());
  const clerkUserId = targetUser?.id ?? null;
  const displayName = targetUser
    ? [targetUser.first_name, targetUser.last_name].filter(Boolean).join(' ') || null
    : null;

  if (existing && !existing.is_active) {
    // Re-activate
    await db
      .from('workplace_members')
      .update({ is_active: true, clerk_user_id: clerkUserId, display_name: displayName, invited_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await db.from('workplace_members').insert({
      workplace_id: workplaceId,
      clerk_user_id: clerkUserId,
      email: email.toLowerCase(),
      display_name: displayName,
      role: 'member',
    });
  }

  // If they already have an account, grant Pro access immediately
  if (clerkUserId) {
    await patchClerkMeta(clerkUserId, {
      isPro: true,
      plan: workplace?.plan ?? 'workplace_starter',
      workplaceId,
      workplaceRole: 'member',
    });
  }

  return NextResponse.json({ ok: true, activated: !!clerkUserId });
}
