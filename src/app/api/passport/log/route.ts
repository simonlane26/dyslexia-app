export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';

const ALLOWED_FEATURES = new Set(['simplify', 'readAloud', 'coach', 'decoder', 'grammarCheck']);

export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const { feature } = await req.json().catch(() => ({}));
  if (!feature || !ALLOWED_FEATURES.has(feature)) {
    return NextResponse.json({ error: 'Invalid feature' }, { status: 400 });
  }

  const meta = (sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;
  const workplaceId = (meta.workplaceId as string) ?? null;

  let db;
  try { db = createSupabaseServerClient(); } catch {
    return NextResponse.json({ ok: true }); // Supabase not configured — silently skip
  }

  await db.from('feature_usage_logs').insert({
    user_id: userId,
    workplace_id: workplaceId || null,
    feature,
  });

  return NextResponse.json({ ok: true });
}
