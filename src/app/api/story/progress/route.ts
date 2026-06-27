import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const {
    storyId,
    wordsRead = 0,
    totalWords = 0,
    wordsLookedUp = [],
    readingMode = 'supported',
    duration = 0,
    completed = false,
  } = body ?? {};

  const db = createSupabaseServerClient();

  await db.from('story_mode_sessions').insert({
    clerk_user_id: userId,
    story_id: storyId ?? null,
    words_read: wordsRead,
    total_words: totalWords,
    words_looked_up: wordsLookedUp,
    reading_mode: readingMode,
    duration_seconds: duration,
    completed_at: completed ? new Date().toISOString() : null,
  });

  // Save looked-up words to vocabulary
  if (Array.isArray(wordsLookedUp) && wordsLookedUp.length > 0) {
    await db
      .from('user_vocabulary')
      .upsert(
        wordsLookedUp.map((word: string) => ({
          user_id: userId,
          word,
          source_type: 'story',
          next_review_at: new Date().toISOString(),
        })),
        { onConflict: 'user_id,word' },
      )
      .then(() => {});
  }

  return NextResponse.json({ ok: true });
}
