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

  let text: string;
  try {
    const body = await req.json();
    text = String(body.text ?? '').slice(0, 500);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!text.trim()) return NextResponse.json({ error: 'text is required' }, { status: 400 });

  const systemPrompt = `You are transcribing a work meeting for someone with dyslexia. Given a spoken text segment, return ONLY JSON: { "simplified": "shorter clearer version using plain English and short sentences, keeping key facts/names/numbers", "type": "normal" | "action" | "decision" } — type is 'action' if someone has been asked to do something, 'decision' if a decision was made, otherwise 'normal'.`;

  try {
    const raw = await callAI(provider, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ], 150);

    const parsed = parseJSON(raw);
    if (!parsed) return NextResponse.json({ simplified: text, type: 'normal' });

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[meetings/transcribe]', err);
    return NextResponse.json({ simplified: text, type: 'normal' });
  }
}
