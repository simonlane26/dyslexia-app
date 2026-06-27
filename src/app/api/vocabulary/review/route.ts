import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// SM-2 spaced repetition algorithm
// quality: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy
function sm2(
  current: { ease_factor: number; interval_days: number; review_count: number },
  quality: number
) {
  let { ease_factor, interval_days, review_count } = current;

  if (quality === 0) {
    // Again — reset to start
    interval_days = 1;
    ease_factor = Math.max(ease_factor - 0.2, 1.3);
  } else if (quality === 1) {
    // Hard — small step forward
    interval_days = Math.max(Math.round(interval_days * 1.2), interval_days + 1);
    ease_factor = Math.max(ease_factor - 0.15, 1.3);
  } else if (quality === 2) {
    // Good — standard progression
    if (review_count === 0) interval_days = 1;
    else if (review_count === 1) interval_days = 3;
    else interval_days = Math.round(interval_days * ease_factor);
  } else {
    // Easy — accelerated progression
    if (review_count === 0) interval_days = 1;
    else if (review_count === 1) interval_days = 4;
    else interval_days = Math.round(interval_days * ease_factor * 1.3);
    ease_factor = Math.min(ease_factor + 0.1, 3.0);
  }

  ease_factor = Math.round(ease_factor * 100) / 100;
  const next_review_at = new Date(
    Date.now() + interval_days * 24 * 60 * 60 * 1000
  ).toISOString();

  return { ease_factor, interval_days, review_count: review_count + 1, next_review_at };
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { wordId, quality } = body ?? {};

  if (!wordId || typeof quality !== 'number' || quality < 0 || quality > 3) {
    return NextResponse.json({ error: 'wordId and quality (0–3) required' }, { status: 400 });
  }

  let db;
  try {
    db = createSupabaseServerClient();
  } catch {
    return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
  }

  const { data: word, error: fetchErr } = await db
    .from('user_vocabulary')
    .select('ease_factor, interval_days, review_count, times_correct')
    .eq('id', wordId)
    .eq('user_id', userId)
    .single();

  if (fetchErr || !word) return NextResponse.json({ error: 'Word not found' }, { status: 404 });

  const updates = sm2(word, quality);
  const timesCorrect = quality >= 2 ? word.times_correct + 1 : word.times_correct;

  const { error: updateErr } = await db
    .from('user_vocabulary')
    .update({
      ease_factor: updates.ease_factor,
      interval_days: updates.interval_days,
      review_count: updates.review_count,
      next_review_at: updates.next_review_at,
      last_reviewed_at: new Date().toISOString(),
      times_correct: timesCorrect,
    })
    .eq('id', wordId)
    .eq('user_id', userId);

  if (updateErr) {
    console.error('[vocabulary/review] update error:', updateErr);
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    next_review_at: updates.next_review_at,
    interval_days: updates.interval_days,
  });
}
