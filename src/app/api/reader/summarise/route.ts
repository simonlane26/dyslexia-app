import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const clean = (s?: string | null) => (s ?? '').trim().replace(/^"(.*)"$/, '$1');

function getProvider(): { url: string; key: string; model: string; headers: Record<string, string> } | null {
  const oaKey = clean(process.env.OPENAI_API_KEY);
  const orKey = clean(process.env.OPENROUTER_API_KEY);
  const siteUrl = clean(process.env.NEXT_PUBLIC_SITE_URL) || 'https://www.dyslexiawrite.com';

  if (oaKey.length > 20) {
    return {
      url: 'https://api.openai.com/v1/chat/completions',
      key: oaKey,
      model: 'gpt-4o-mini',
      headers: { Authorization: `Bearer ${oaKey}`, 'Content-Type': 'application/json' },
    };
  }
  if (orKey.length > 20) {
    return {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      key: orKey,
      model: 'openai/gpt-4o-mini',
      headers: {
        Authorization: `Bearer ${orKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': siteUrl,
        'X-Title': 'DyslexiaWrite Reader',
      },
    };
  }
  return null;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const text = String(body?.text ?? '').trim();
  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 });

  const provider = getProvider();
  if (!provider) return NextResponse.json({ error: 'No AI provider configured' }, { status: 500 });

  const res = await fetch(provider.url, {
    method: 'POST',
    headers: provider.headers,
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.2,
      max_tokens: 80,
      messages: [
        { role: 'system', content: 'Summarise the following text in one plain-English sentence of under 20 words. Output only the sentence, no punctuation at the end.' },
        { role: 'user', content: text },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => 'unknown');
    console.error('[reader/summarise] provider error', res.status, err);
    return NextResponse.json({ error: 'Provider error' }, { status: 502 });
  }
  const json = await res.json();
  const summary = json?.choices?.[0]?.message?.content?.trim() ?? '';
  return NextResponse.json({ summary });
}
