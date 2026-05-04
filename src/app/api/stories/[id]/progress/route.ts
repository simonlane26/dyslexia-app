import 'server-only';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: seriesId } = await params;

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const lastWordIndex = typeof body?.lastWordIndex === 'number' ? body.lastWordIndex : null;
  const completed = body?.completed === true;

  const db = createSupabaseServerClient();

  // Verify the series belongs to this user
  const { data: series } = await db
    .from('story_series')
    .select('id')
    .eq('id', seriesId)
    .eq('clerk_user_id', userId)
    .single();

  if (!series) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Update the current episode's progress
  const episodeUpdate: Record<string, any> = {};
  if (lastWordIndex !== null) episodeUpdate.last_word_index = lastWordIndex;
  if (completed) episodeUpdate.completed_at = new Date().toISOString();

  if (Object.keys(episodeUpdate).length > 0) {
    await db
      .from('story_episodes')
      .update(episodeUpdate)
      .eq('series_id', seriesId)
      .eq('episode_number', body?.episodeNumber ?? 1);
  }

  // Update last_read_at on the series
  await db
    .from('story_series')
    .update({ last_read_at: new Date().toISOString() })
    .eq('id', seriesId);

  return NextResponse.json({ ok: true });
}
