import 'server-only';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { LEVEL_CONFIG, type ReadingLevel } from '@/lib/storyLevels';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function cleanEnv(v?: string | null) {
  return (v || '').trim().replace(/^"(.*)"$/, '$1');
}

const OPENAI_KEY = cleanEnv(process.env.OPENAI_API_KEY);
const OPENROUTER_KEY = cleanEnv(process.env.OPENROUTER_API_KEY);
const SITE_URL = cleanEnv(process.env.NEXT_PUBLIC_SITE_URL) || 'https://www.dyslexiawrite.com';

function buildStoryPrompt(
  theme: string,
  characterName: string,
  customDetails: string,
  level: ReadingLevel,
): string {
  const cfg = LEVEL_CONFIG[level];
  return `You are a children's story writer creating personalised stories for a dyslexic reader.

THE READER:
- Reading level: ${level} out of 5 (${cfg.label})
- Target length: ${cfg.targetWords} words (aim for ±10%)
- Maximum sentence length: ${cfg.maxSentenceLength} words per sentence

STORY RULES:
1. Keep all sentences under ${cfg.maxSentenceLength} words
2. Use simple, everyday vocabulary — avoid long or unusual words
3. Write short paragraphs of 2–3 sentences each
4. Include dialogue (about 40% of the story) — it breaks up text and is easier to read
5. Clear beginning, middle, and end — the story must feel complete
6. Warm, fun, age-appropriate tone
7. Use "---" on its own line (no other text on that line) to mark the section break between beginning/middle and middle/end

After the story (on new lines), add these metadata lines exactly:
TITLE: [A short exciting title, max 6 words]
SETTING: [One sentence describing where the story takes place]
VOCAB: [2–3 interesting words from the story, comma-separated]
RECAP: [2–3 sentences starting with "Last time..." summarising the story — for next time]
TEASER: [2 sentences hinting excitingly at what might happen in a follow-up story]

Write the story now. Main character: ${characterName}. Theme: ${theme}.${customDetails ? ` Extra details: ${customDetails}` : ''}`;
}

function parseMetadata(raw: string) {
  const lines = raw.split('\n');
  const get = (key: string) => {
    const line = lines.find(l => l.startsWith(`${key}:`));
    return line ? line.slice(key.length + 1).trim() : '';
  };
  const titleLine = get('TITLE');
  const settingLine = get('SETTING');
  const vocabLine = get('VOCAB');
  const recapLine = get('RECAP');
  const teaserLine = get('TEASER');

  // Strip the metadata block from the story text
  const metaStart = raw.search(/\nTITLE:/);
  const storyText = metaStart > -1 ? raw.slice(0, metaStart).trim() : raw.trim();

  return {
    storyText,
    title: titleLine || 'A New Adventure',
    setting: settingLine || '',
    vocab: vocabLine ? vocabLine.split(',').map(w => w.trim()).filter(Boolean) : [],
    recap: recapLine || '',
    teaser: teaserLine || '',
  };
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const theme = String(body?.theme || '').slice(0, 200).trim();
  const characterName = String(body?.characterName || 'the hero').slice(0, 50).trim();
  const customDetails = String(body?.customDetails || '').slice(0, 300).trim();
  const level = (Number(body?.readingLevel) || 2) as ReadingLevel;
  const safeLevel: ReadingLevel = ([1, 2, 3, 4, 5] as ReadingLevel[]).includes(level) ? level : 2;

  if (!theme) return NextResponse.json({ error: 'Theme required' }, { status: 400 });

  const useOpenAI = OPENAI_KEY.length > 20;
  const useOpenRouter = OPENROUTER_KEY.length > 20;
  if (!useOpenAI && !useOpenRouter) {
    return NextResponse.json({ error: 'No AI provider configured' }, { status: 500 });
  }

  const url = useOpenAI
    ? 'https://api.openai.com/v1/chat/completions'
    : 'https://openrouter.ai/api/v1/chat/completions';
  const model = useOpenAI ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';
  const apiKey = useOpenAI ? OPENAI_KEY : OPENROUTER_KEY;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  if (!useOpenAI) {
    headers['HTTP-Referer'] = SITE_URL;
    headers['X-Title'] = 'DyslexiaWrite Stories';
  }

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 45_000);

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers,
      signal: ctrl.signal,
      body: JSON.stringify({
        model,
        temperature: 0.85,
        max_tokens: 1800,
        messages: [
          { role: 'user', content: buildStoryPrompt(theme, characterName, customDetails, safeLevel) },
        ],
      }),
    });
    clearTimeout(timeout);

    if (!upstream.ok) {
      const err = await upstream.text();
      return NextResponse.json({ error: err }, { status: upstream.status });
    }

    const data = await upstream.json();
    const raw = data.choices?.[0]?.message?.content || '';
    if (!raw) return NextResponse.json({ error: 'Empty AI response' }, { status: 500 });

    const { storyText, title, setting, vocab, recap, teaser } = parseMetadata(raw);
    const wordCount = storyText.split(/\s+/).filter(Boolean).length;

    // Save to Supabase
    const db = createSupabaseServerClient();

    const { data: series, error: seriesErr } = await db
      .from('story_series')
      .insert({
        clerk_user_id: userId,
        title,
        theme,
        character_name: characterName,
        setting: setting || null,
        reading_level: safeLevel,
        current_episode: 1,
      })
      .select()
      .single();

    if (seriesErr) {
      console.error('story_series insert error:', seriesErr);
      return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
    }

    const { data: episode, error: episodeErr } = await db
      .from('story_episodes')
      .insert({
        series_id: series.id,
        episode_number: 1,
        text: storyText,
        recap,
        next_teaser: teaser,
        word_count: wordCount,
        new_vocabulary: vocab,
      })
      .select()
      .single();

    if (episodeErr) {
      console.error('story_episodes insert error:', episodeErr);
      return NextResponse.json({ error: 'Failed to save episode' }, { status: 500 });
    }

    return NextResponse.json({
      seriesId: series.id,
      episodeId: episode.id,
      title,
      text: storyText,
      wordCount,
      vocab,
      teaser,
      readingLevel: safeLevel,
    });
  } catch (e: any) {
    clearTimeout(timeout);
    if (e.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out' }, { status: 504 });
    }
    console.error('generate story error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
