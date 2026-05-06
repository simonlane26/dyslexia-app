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
  if (oaKey.length > 20) return { url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini', headers: { Authorization: `Bearer ${oaKey}`, 'Content-Type': 'application/json' } as Record<string,string> };
  if (orKey.length > 20) return { url: 'https://openrouter.ai/api/v1/chat/completions', model: 'openai/gpt-4o-mini', headers: { Authorization: `Bearer ${orKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': siteUrl, 'X-Title': 'DyslexiaWrite Meetings' } as Record<string,string> };
  return null;
}

async function callAI(provider: NonNullable<ReturnType<typeof getProvider>>, messages: {role:string,content:string}[], max_tokens=1200) {
  const res = await fetch(provider.url, {
    method: 'POST',
    headers: provider.headers,
    body: JSON.stringify({ model: provider.model, temperature: 0.3, max_tokens, messages }),
  });
  if (!res.ok) throw new Error(`Provider ${res.status}`);
  const json = await res.json();
  return json?.choices?.[0]?.message?.content?.trim() ?? '';
}

function parseJSON(raw: string) {
  try { return JSON.parse(raw); } catch { /* */ }
  const m = raw.match(/\{[\s\S]*\}/);
  if (m) try { return JSON.parse(m[0]); } catch { /* */ }
  return null;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const provider = getProvider();
  if (!provider) return NextResponse.json({ error: 'No AI provider configured' }, { status: 503 });

  let agenda: string;
  try {
    const body = await req.json();
    agenda = String(body.agenda ?? '').slice(0, 3000);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!agenda.trim()) return NextResponse.json({ error: 'agenda is required' }, { status: 400 });

  const systemPrompt = `You are helping someone with dyslexia prepare for a work meeting. They will paste a meeting agenda. For each numbered agenda item, provide: a clear plain-English explanation (2-3 sentences, no jargon), whether it's likely to directly affect the attendee's daily work (affects: true/false), and 1-2 questions they could ask (or empty array). Return ONLY a JSON object: { "items": [ { "num": 1, "title": "short title under 6 words", "explanation": "...", "affects": true, "questions": ["..."] } ] }`;

  try {
    const raw = await callAI(provider, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: agenda },
    ], 1500);

    const parsed = parseJSON(raw);
    if (!parsed) return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 });

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[meetings/prep]', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 502 });
  }
}
