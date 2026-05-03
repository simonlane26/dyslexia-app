import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getApiKey() {
  const k = (process.env.OPENAI_API_KEY || '').trim().replace(/^"|"$/g, '');
  return k.length > 10 ? k : null;
}

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const meta = (sessionClaims?.publicMetadata ?? {}) as Record<string, any>;
  const isPro = meta.isPro === true || ['workplace_starter','workplace_business','workplace_enterprise','school_starter','school_mid','school_full'].includes(meta.plan);
  if (!isPro) return NextResponse.json({ error: 'Pro required' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const text = String(body?.text ?? '').trim();
  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 });

  const key = getApiKey();
  if (!key) return NextResponse.json({ error: 'No API key' }, { status: 500 });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 80,
      messages: [
        { role: 'system', content: 'Summarise the following text in one plain-English sentence of under 20 words. Output only the sentence, no punctuation at the end.' },
        { role: 'user', content: text },
      ],
    }),
  });

  if (!res.ok) return NextResponse.json({ error: 'Provider error' }, { status: 502 });
  const json = await res.json();
  const summary = json?.choices?.[0]?.message?.content?.trim() ?? '';
  return NextResponse.json({ summary });
}
