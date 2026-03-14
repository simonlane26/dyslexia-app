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

const SYSTEM_PROMPT = `You are a friendly, patient writing helper inside DyslexiaWrite. You are talking directly with the person who is writing.

YOUR ROLE:
- You guide the writer step by step — you never write FOR them
- You help them find their OWN words and ideas
- You ask ONE simple question at a time
- You keep every reply to 1–3 sentences maximum
- You use plain, everyday language — no grammar jargon ever
- You are always encouraging. Never critical. Never negative.

HOW TO HELP:
- If they haven't started: ask what they want to write about and get them talking first
- If they're stuck: offer two options ("Would you rather write about X or Y?")
- If they've written something: notice something good first, then ask a follow-up question
- If a sentence is very long: gently ask if they'd like help splitting it
- If asked to tidy spelling/grammar: do it while keeping their exact words and voice
- If they ask "does this make sense?": summarise what you understood from their text, then ask if that's what they meant

ALWAYS remember: your job is to be a quiet, confident helper in the background. One question. Short. Warm. That's it.`;

function buildMessages(
  documentText: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[]
) {
  // Inject document state as a system context message before the conversation
  const docContext = documentText.trim()
    ? `The writer's document so far:\n"""\n${documentText.slice(0, 3000)}\n"""`
    : 'The writer has not started yet. The document is empty.';

  return [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'system' as const, content: docContext },
    ...chatHistory,
  ];
}

export async function POST(req: NextRequest) {
  // 1) Auth check
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

  const documentText = String(body?.documentText ?? '').slice(0, 10_000);
  const chatHistory: { role: 'user' | 'assistant'; content: string }[] =
    Array.isArray(body?.chatHistory) ? body.chatHistory.slice(-20) : [];

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
    headers['X-Title'] = 'DyslexiaWrite Assistant';
  }

  // 5) Call AI
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 25_000);

  try {
    const messages = buildMessages(documentText, chatHistory);
    const upstream = await fetch(url, {
      method: 'POST',
      headers,
      signal: ctrl.signal,
      body: JSON.stringify({ model, temperature: 0.7, max_tokens: 200, messages }),
    });
    clearTimeout(timeout);

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return NextResponse.json({ error: 'PROVIDER_ERROR', detail }, { status: 502 });
    }

    const data = await upstream.json();
    const message = data?.choices?.[0]?.message?.content?.trim() ?? '';

    if (!message) {
      return NextResponse.json({ error: 'EMPTY_RESPONSE' }, { status: 502 });
    }

    return NextResponse.json({ message }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    clearTimeout(timeout);
    return NextResponse.json({ error: 'INTERNAL', detail: e?.message }, { status: 500 });
  }
}
