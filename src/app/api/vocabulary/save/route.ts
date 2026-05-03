import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.word?.trim()) return NextResponse.json({ error: 'word required' }, { status: 400 });

  const word = body.word.toLowerCase().trim();
  const schoolId = (sessionClaims?.publicMetadata as any)?.schoolId ?? null;

  let db;
  try {
    db = createSupabaseServerClient();
  } catch (e) {
    return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
  }

  // Check if word already saved
  const { data: existing } = await db
    .from('user_vocabulary')
    .select('id, times_seen')
    .eq('user_id', userId)
    .eq('word', word)
    .maybeSingle();

  if (existing) {
    await db
      .from('user_vocabulary')
      .update({ times_seen: existing.times_seen + 1 })
      .eq('id', existing.id);
    return NextResponse.json({ saved: true, existing: true });
  }

  const { error } = await db.from('user_vocabulary').insert({
    user_id: userId,
    word,
    phonetic: body.phonetic ?? null,
    syllables: body.syllables ?? [],
    definition: body.definition ?? null,
    example_sentence: body.example ?? null,
    source_context: body.context ?? null,
    source_type: body.sourceType ?? 'story',
    school_id: schoolId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ saved: true, existing: false });
}
