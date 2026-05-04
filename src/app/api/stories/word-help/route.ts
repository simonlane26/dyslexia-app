import 'server-only';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function cleanEnv(v?: string | null) {
  return (v || '').trim().replace(/^"(.*)"$/, '$1');
}

const OPENAI_KEY = cleanEnv(process.env.OPENAI_API_KEY);
const OPENROUTER_KEY = cleanEnv(process.env.OPENROUTER_API_KEY);
const SITE_URL = cleanEnv(process.env.NEXT_PUBLIC_SITE_URL) || 'https://www.dyslexiawrite.com';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const word = String(body?.word || '').trim().slice(0, 50);
  const context = String(body?.context || '').trim().slice(0, 300);
  const readingLevel = Number(body?.readingLevel) || 2;

  if (!word) return NextResponse.json({ error: 'Word required' }, { status: 400 });

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

  const prompt = `A child (reading level ${readingLevel}/5) tapped the word "${word}" while reading this sentence: "${context}"

Return JSON with these exact keys:
{
  "syllables": ["list", "of", "syllables"],
  "phonetic": "SIMPLE-phonetic spelling in capitals with hyphens",
  "definition": "Simple definition in under 20 words, using words a ${readingLevel * 2 + 4}-year-old would understand",
  "example": "A short, relatable example sentence using the word"
}

Only return the JSON object, nothing else.`;

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 15_000);

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers,
      signal: ctrl.signal,
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    clearTimeout(timeout);

    if (!upstream.ok) {
      const err = await upstream.text();
      return NextResponse.json({ error: err }, { status: upstream.status });
    }

    const data = await upstream.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    const result = JSON.parse(raw);

    return NextResponse.json({
      syllables: Array.isArray(result.syllables) ? result.syllables : [word],
      phonetic: result.phonetic || word.toUpperCase(),
      definition: result.definition || 'A word from the story.',
      example: result.example || '',
    });
  } catch (e: any) {
    clearTimeout(timeout);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
