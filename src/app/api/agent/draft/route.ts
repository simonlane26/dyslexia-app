import 'server-only';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function cleanEnv(v?: string | null) {
  return (v || '').trim().replace(/^"(.*)"$/, '$1');
}

const OPENAI_KEY = cleanEnv(process.env.OPENAI_API_KEY);
const OPENROUTER_KEY = cleanEnv(process.env.OPENROUTER_API_KEY);
const SITE_URL = cleanEnv(process.env.NEXT_PUBLIC_SITE_URL) || 'https://www.dyslexiawrite.com';

const SYSTEM_PROMPT = `You are a helpful writing assistant for dyslexic users.

Your job is to take a conversation where a writer has been sharing their ideas and turn those ideas into a short, clear paragraph — written in THEIR voice, not yours.

RULES:
- Use simple, everyday words
- Write in the first person if that's how they spoke
- Keep their meaning exactly — do not add new ideas they didn't mention
- Keep it to 3–5 sentences maximum
- Do NOT start with "Here is your paragraph" or any preamble — just write the paragraph directly
- Do NOT use grammar jargon or fancy words
- Write the way the person talks, just tidied up slightly`;

export async function POST(req: NextRequest) {
  // 1) Auth
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'NOT_SIGNED_IN' }, { status: 401 });
  }

  // 2) Pro check
  const user = await currentUser();
  const isPro =
    (user?.publicMetadata as any)?.isPro === true ||
    (user?.unsafeMetadata as any)?.isPro === true;
  if (!isPro) {
    return NextResponse.json({ error: 'PRO_REQUIRED' }, { status: 403 });
  }

  // 3) Parse body
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'BAD_JSON' }, { status: 400 });
  }

  const chatHistory: { role: 'user' | 'assistant'; content: string }[] =
    Array.isArray(body?.chatHistory) ? body.chatHistory.slice(-30) : [];

  if (chatHistory.length < 2) {
    return NextResponse.json({ error: 'NOT_ENOUGH_CONTEXT' }, { status: 400 });
  }

  // 4) Pick provider
  const useOpenAI = OPENAI_KEY && OPENAI_KEY.length > 20;
  const useOpenRouter = OPENROUTER_KEY && OPENROUTER_KEY.length > 20;

  if (!useOpenAI && !useOpenRouter) {
    return NextResponse.json({ error: 'NO_PROVIDER' }, { status: 500 });
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
    headers['X-Title'] = 'DyslexiaWrite Draft';
  }

  // Build conversation summary for the draft request
  const conversationText = chatHistory
    .map(m => `${m.role === 'user' ? 'Writer' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    {
      role: 'user' as const,
      content: `Here is the conversation where the writer shared their ideas:\n\n${conversationText}\n\nPlease write a short paragraph using only the ideas the writer shared.`,
    },
  ];

  // 5) Call AI
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 25_000);

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers,
      signal: ctrl.signal,
      body: JSON.stringify({ model, temperature: 0.5, max_tokens: 300, messages }),
    });
    clearTimeout(timeout);

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return NextResponse.json({ error: 'PROVIDER_ERROR', detail }, { status: 502 });
    }

    const data = await upstream.json();
    const draft = data?.choices?.[0]?.message?.content?.trim() ?? '';

    if (!draft) {
      return NextResponse.json({ error: 'EMPTY_RESPONSE' }, { status: 502 });
    }

    return NextResponse.json({ draft }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    clearTimeout(timeout);
    return NextResponse.json({ error: 'INTERNAL', detail: e?.message }, { status: 500 });
  }
}
