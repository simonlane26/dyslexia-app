import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const clean = (s?: string | null) => (s ?? '').trim().replace(/^"(.*)"$/, '$1');

function getProvider() {
  const oaKey = clean(process.env.OPENAI_API_KEY);
  const orKey = clean(process.env.OPENROUTER_API_KEY);
  const siteUrl = clean(process.env.NEXT_PUBLIC_SITE_URL) || 'https://www.dyslexiawrite.com';
  if (oaKey.length > 20) return {
    url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini',
    headers: { Authorization: `Bearer ${oaKey}`, 'Content-Type': 'application/json' } as Record<string, string>,
  };
  if (orKey.length > 20) return {
    url: 'https://openrouter.ai/api/v1/chat/completions', model: 'openai/gpt-4o-mini',
    headers: { Authorization: `Bearer ${orKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': siteUrl, 'X-Title': 'DyslexiaWrite Lessons' } as Record<string, string>,
  };
  return null;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const topic = String(body?.topic ?? '').trim();
  if (!topic) return NextResponse.json({ error: 'topic required' }, { status: 400 });

  const provider = getProvider();
  if (!provider) return NextResponse.json({ error: 'No AI provider configured' }, { status: 500 });

  const prompt = `You are helping a student with dyslexia prepare for a classroom lesson.

Given the lesson topic below, return a JSON object (no markdown, no code blocks) with:
- "topicSummary": 2-3 plain-English sentences explaining what this lesson is about. Use simple vocabulary. Avoid unexplained jargon.
- "vocab": array of up to 7 key words/phrases the teacher will use. Each item: { "word": string, "pronunciation": string (phonetic, hyphen-separated, CAPS on stressed syllable), "definition": string (1-2 plain-English sentences) }
- "whatToListen": 1-2 sentences telling the student what to pay close attention to in the lesson. Friendly and encouraging.
- "questions": array of 3 good questions the student could ask the teacher during or after the lesson.

Lesson topic: ${topic}`;

  const res = await fetch(provider.url, {
    method: 'POST',
    headers: provider.headers,
    body: JSON.stringify({
      model: provider.model, temperature: 0.3, max_tokens: 900,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) return NextResponse.json({ error: 'Provider error' }, { status: 502 });

  const json = await res.json();
  const text = (json?.choices?.[0]?.message?.content ?? '').trim()
    .replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ error: 'Parse error' }, { status: 502 });
  }
}
