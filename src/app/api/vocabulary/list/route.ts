import 'server-only';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let db;
  try {
    db = createSupabaseServerClient();
  } catch {
    return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
  }

  const { data, error } = await db
    .from('user_vocabulary')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const now = new Date().toISOString();
  const words = data ?? [];
  const due = words.filter(w => w.next_review_at <= now).length;
  const mastered = words.filter(w => w.interval_days >= 21).length;
  const learning = words.filter(w => w.interval_days < 4).length;

  return NextResponse.json({
    words,
    stats: { total: words.length, due, mastered, learning },
  });
}
