export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import { DECODER_CHAT_SYSTEM } from '@/lib/document-decoder';

const openai = new OpenAI();

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const documentText: string = String(body?.documentText || '').slice(0, 50_000);
  const messages: { role: 'user' | 'assistant'; content: string }[] = (body?.messages || [])
    .slice(-10)
    .map((m: any) => ({ role: m.role, content: String(m.content ?? '').slice(0, 2_000) }));

  if (!documentText) return NextResponse.json({ error: 'No document text provided' }, { status: 400 });
  if (!messages.length) return NextResponse.json({ error: 'No messages provided' }, { status: 400 });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: DECODER_CHAT_SYSTEM(documentText) },
      ...messages.slice(-10), // keep last 10 turns to stay within token budget
    ],
    max_tokens: 600,
  });

  const reply = response.choices[0]?.message?.content || 'Sorry, I could not answer that.';
  return NextResponse.json({ reply });
}
