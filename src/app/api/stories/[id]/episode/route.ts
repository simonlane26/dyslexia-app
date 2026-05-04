import 'server-only';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: seriesId } = await params;
  const db = createSupabaseServerClient();

  // Verify ownership
  const { data: series } = await db
    .from('story_series')
    .select('id, title, current_episode, reading_level')
    .eq('id', seriesId)
    .eq('clerk_user_id', userId)
    .single();

  if (!series) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Get the current episode
  const { data: episode } = await db
    .from('story_episodes')
    .select('id, episode_number, text, recap, next_teaser, word_count, last_word_index, new_vocabulary')
    .eq('series_id', seriesId)
    .eq('episode_number', series.current_episode)
    .single();

  if (!episode) return NextResponse.json({ error: 'Episode not found' }, { status: 404 });

  return NextResponse.json({
    seriesId,
    title: series.title,
    readingLevel: series.reading_level,
    episode,
  });
}
