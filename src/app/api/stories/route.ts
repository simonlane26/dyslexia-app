import 'server-only';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createSupabaseServerClient();

  const { data, error } = await db
    .from('story_series')
    .select(`
      id, title, theme, character_name, reading_level,
      current_episode, is_complete, last_read_at, created_at,
      story_episodes (
        id, episode_number, word_count, last_word_index, completed_at
      )
    `)
    .eq('clerk_user_id', userId)
    .order('last_read_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('stories list error:', error);
    return NextResponse.json({ error: 'Failed to load stories' }, { status: 500 });
  }

  return NextResponse.json({ stories: data ?? [] });
}
