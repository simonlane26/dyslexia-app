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

  let transcript: string;
  let agenda: string;
  try {
    const body = await req.json();
    transcript = String(body.transcript ?? '');
    agenda = String(body.agenda ?? '');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!transcript.trim()) return NextResponse.json({ error: 'transcript is required' }, { status: 400 });

  const systemPrompt = `You are summarising a work meeting for someone with dyslexia. Return ONLY JSON: { "overview": "2-3 plain English sentences about what was covered", "decisions": ["decision 1", ...], "actions": [ { "task": "what to do", "deadline": "deadline or null", "context": "which agenda item" } ], "emailSubject": "short follow-up email subject", "emailBody": "plain text email body listing actions, friendly and brief" }`;

  const userContent = agenda.trim()
    ? `Agenda:\n${agenda}\n\nTranscript:\n${transcript}`
    : `Transcript:\n${transcript}`;

  try {
    const raw = await callAI(provider, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ], 1200);

    const parsed = parseJSON(raw);
    if (!parsed) return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 });

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[meetings/summarise]', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 502 });
  }
}
