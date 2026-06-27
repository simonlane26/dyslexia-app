import 'server-only';
import { NextResponse } from 'next/server';
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

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await getClerkUser(userId);
  if (!clerkUser) return NextResponse.json({ error: 'Could not verify user' }, { status: 500 });

  const meta = clerkUser.public_metadata ?? {};

  if (!WORKPLACE_PLANS.includes(meta.plan) || meta.workplaceRole !== 'admin') {
    return NextResponse.json({ error: 'Workspace admins only' }, { status: 403 });
  }
  if (!meta.workplaceId) {
    return NextResponse.json({ error: 'No workspace linked' }, { status: 403 });
  }

  let db;
  try {
    db = createSupabaseServerClient();
  } catch (e) {
    console.error('[workplace/dashboard] DB init error:', e);
    return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
  }

  const workplaceId: string = meta.workplaceId;

  const { data: workplace, error: wpErr } = await db
    .from('workplaces')
    .select('id, name, plan, max_users, invite_code, created_at')
    .eq('id', workplaceId)
    .maybeSingle();

  if (wpErr || !workplace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  const { data: members, error: memErr } = await db
    .from('workplace_members')
    .select('id, clerk_user_id, email, display_name, role, is_active, invited_at, joined_at, simplifications_used, rewrites_used, last_active')
    .eq('workplace_id', workplaceId)
    .order('invited_at', { ascending: true });

  if (memErr) {
    return NextResponse.json({ error: 'Failed to load members' }, { status: 500 });
  }

  const activeMembers = (members ?? []).filter(m => m.is_active);
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const activeThisWeek = activeMembers.filter(m => m.last_active && m.last_active >= oneWeekAgo).length;
  const totalSimplifications = activeMembers.reduce((sum, m) => sum + (m.simplifications_used ?? 0), 0);
  const totalRewrites = activeMembers.reduce((sum, m) => sum + (m.rewrites_used ?? 0), 0);

  // Decoder stats for current calendar month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data: decoderRows } = await db
    .from('decoder_logs')
    .select('document_type')
    .eq('workplace_id', workplaceId)
    .gte('decoded_at', monthStart.toISOString());

  const totalDecoded = (decoderRows ?? []).length;
  const typeCounts: Record<string, number> = {};
  for (const row of decoderRows ?? []) {
    const t = row.document_type || 'Document';
    typeCounts[t] = (typeCounts[t] ?? 0) + 1;
  }
  const topDocumentTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));

  return NextResponse.json({
    workplace,
    members: members ?? [],
    stats: {
      totalMembers: activeMembers.length,
      licencesUsed: activeMembers.length,
      licencesTotal: workplace.max_users,
      activeThisWeek,
      totalSimplifications,
      totalRewrites,
    },
    decoderStats: {
      totalDecoded,
      topDocumentTypes,
    },
  });
}
