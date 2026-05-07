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

const SYSTEM = `You are a classroom assistant helping a student with dyslexia follow a lesson in real time.

Given what the teacher just said, return JSON (no markdown) with:
- "simplified": rewrite in plain English. Short sentences, simple words. Keep subject-specific terms but explain them briefly inline. 1-4 sentences max.
- "type": classify as exactly one of:
  - "explain" — teacher is explaining or describing something
  - "keyword" — a key term or vocabulary word is being introduced or defined
  - "task" — homework, assignment, or task is being set
  - "important" — something the student must write down (equation, date, definition, exam content)`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const text = String(body?.text ?? '').trim();
  if (!text) return NextResponse.json({ simplified: '', type: 'explain' });

  const provider = getProvider();
  if (!provider) return NextResponse.json({ simplified: text, type: 'explain' });

  const res = await fetch(provider.url, {
    method: 'POST',
    headers: provider.headers,
    body: JSON.stringify({
      model: provider.model, temperature: 0.2, max_tokens: 200,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: text },
      ],
    }),
  });

  if (!res.ok) return NextResponse.json({ simplified: text, type: 'explain' });

  const json = await res.json();
  const raw = (json?.choices?.[0]?.message?.content ?? '').trim()
    .replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  try {
    const parsed = JSON.parse(raw);
    const validTypes = ['explain', 'keyword', 'task', 'important'];
    return NextResponse.json({
      simplified: parsed.simplified || text,
      type: validTypes.includes(parsed.type) ? parsed.type : 'explain',
    });
  } catch {
    return NextResponse.json({ simplified: text, type: 'explain' });
  }
}
