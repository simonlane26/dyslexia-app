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
  const transcript = String(body?.transcript ?? '').trim();
  const topic = String(body?.topic ?? '').trim();
  if (!transcript) return NextResponse.json({ error: 'transcript required' }, { status: 400 });

  const provider = getProvider();
  if (!provider) return NextResponse.json({ error: 'No AI provider configured' }, { status: 500 });

  const prompt = `You are creating revision notes for a student with dyslexia based on a captured classroom lesson.

Lesson topic: ${topic || 'unknown'}

Captured transcript (each line prefixed with [type]):
${transcript}

Return a JSON object (no markdown, no code blocks) with these exact fields:
- "title": short title for the revision notes (e.g. "Photosynthesis — Revision Notes")
- "overview": 2-3 plain-English sentences summarising what was covered
- "keyFacts": array of 4-6 things to remember. Each: { "icon": one emoji, "important": boolean (true for the 2 most critical), "text": the fact as a plain sentence — no HTML tags }
- "vocab": array of key subject terms. Each: { "word": string, "pronunciation": phonetic hyphenated CAPS-on-stress, "definition": plain English 1-2 sentences }
- "pictureThis": a vivid 3-4 sentence visual metaphor to help remember the topic (Lindamood-Bell style — describe a concrete scene or analogy)
- "quiz": array of exactly 2 multiple-choice questions. Each: { "question": string, "options": array of exactly 3 strings, "correctIndex": 0-indexed integer }
- "homework": if any homework or task was set (type=task items), { "task": string, "deadline": string }. Otherwise null.`;

  const res = await fetch(provider.url, {
    method: 'POST',
    headers: provider.headers,
    body: JSON.stringify({
      model: provider.model, temperature: 0.3, max_tokens: 1200,
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
