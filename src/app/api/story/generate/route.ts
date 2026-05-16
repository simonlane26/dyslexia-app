import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const clean = (s?: string | null) => (s ?? '').trim().replace(/^"(.*)"$/, '$1');

function getProvider() {
  const oaKey = clean(process.env.OPENAI_API_KEY);
  const orKey = clean(process.env.OPENROUTER_API_KEY);
  const siteUrl = clean(process.env.NEXT_PUBLIC_SITE_URL) || 'https://www.dyslexiawrite.com';
  if (oaKey.length > 20) return {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    headers: { Authorization: `Bearer ${oaKey}`, 'Content-Type': 'application/json' } as Record<string, string>,
  };
  if (orKey.length > 20) return {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'openai/gpt-4o-mini',
    headers: {
      Authorization: `Bearer ${orKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': siteUrl,
      'X-Title': 'DyslexiaWrite Stories',
    } as Record<string, string>,
  };
  return null;
}

const LEVEL_GUIDES: Record<string, string> = {
  easy: 'Use very simple words (mostly 1–2 syllables). Short sentences (8–12 words). Very concrete ideas. Great for ages 6–8.',
  medium: 'Use everyday language. Mix short and medium sentences (8–18 words). Some new vocabulary with context clues. Great for ages 9–11.',
  harder: 'Use richer vocabulary with occasionally challenging words. Varied sentence lengths. More complex ideas. Great for ages 12+.',
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const theme = String(body?.theme ?? 'pirates').trim().slice(0, 100);
  const readingLevel = (['easy', 'medium', 'harder'] as const).includes(body?.readingLevel)
    ? (body.readingLevel as 'easy' | 'medium' | 'harder')
    : 'easy';
  const isPro = body?.isPro === true;

  // Free tier: 1 generated story per week
  if (!isPro) {
    const db = createSupabaseServerClient();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await db
      .from('story_mode_stories')
      .select('id', { count: 'exact', head: true })
      .eq('clerk_user_id', userId)
      .gte('created_at', oneWeekAgo);
    if ((count ?? 0) >= 1) {
      return NextResponse.json({ error: 'free_limit' }, { status: 403 });
    }
  }

  const provider = getProvider();
  if (!provider) return NextResponse.json({ error: 'No AI provider configured' }, { status: 500 });

  const levelGuide = LEVEL_GUIDES[readingLevel];

  const prompt = `You are a children's story author creating engaging, dyslexia-friendly stories.
Create a short story with the theme: "${theme}".
Reading level guidance: ${levelGuide}

Return a JSON object (no markdown, no code blocks) with exactly these keys:
- "title": string — fun, engaging title (max 8 words)
- "warmupWords": array of 4–5 key vocabulary words the child should learn before reading. Each item: { "word": string, "phonetic": string (hyphen-separated syllables, CAPS on stressed syllable, e.g. "AD-ven-ture"), "syllables": string[] (e.g. ["ad","ven","ture"]), "definition": string (one simple sentence, max 15 words) }
- "paragraphs": array of 4–6 paragraphs. Each: { "sentences": string[] (2–4 sentences per paragraph) }
- "vocabDB": object mapping each warmupWord's lowercase word to its full entry { "word": string, "phonetic": string, "syllables": string[], "definition": string }

Story requirements:
- Fun, positive, age-appropriate
- Short sentences and concrete, visual language
- Interesting problem and satisfying resolution
- Main character who feels capable and clever
- No scary, violent, or upsetting content`;

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 45_000);

  try {
    const res = await fetch(provider.url, {
      method: 'POST',
      headers: provider.headers,
      signal: ctrl.signal,
      body: JSON.stringify({
        model: provider.model,
        temperature: 0.8,
        max_tokens: 1600,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) return NextResponse.json({ error: 'Provider error' }, { status: 502 });

    const json = await res.json();
    const raw = (json?.choices?.[0]?.message?.content ?? '').trim()
      .replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    let storyData: any;
    try {
      storyData = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Parse error' }, { status: 502 });
    }

    // Save to Supabase
    const db = createSupabaseServerClient();
    const { data: saved } = await db
      .from('story_mode_stories')
      .insert({
        clerk_user_id: userId,
        title: storyData.title ?? 'A New Adventure',
        theme,
        reading_level: readingLevel,
        warmup_words: storyData.warmupWords ?? [],
        paragraphs: storyData.paragraphs ?? [],
        vocab_db: storyData.vocabDB ?? {},
      })
      .select('id')
      .single();

    return NextResponse.json({
      id: saved?.id ?? crypto.randomUUID(),
      title: storyData.title ?? 'A New Adventure',
      theme,
      readingLevel,
      warmupWords: storyData.warmupWords ?? [],
      paragraphs: storyData.paragraphs ?? [],
      vocabDB: storyData.vocabDB ?? {},
      createdAt: new Date().toISOString(),
    });
  } catch (e: any) {
    clearTimeout(timeout);
    if (e?.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
