import 'server-only';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are a reading support assistant for dyslexic readers.
Given a word, respond with ONLY a JSON object (no markdown, no code block) with:
- "definition": a warm, simple explanation in 1-2 short sentences using very simple everyday words
- "phonetics": the pronunciation in uppercase syllables separated by hyphens (e.g. "COM-pass" or "SHIV-erd")
- "syllables": an array of lowercase syllable strings (e.g. ["com","pass"])

Example for "compass":
{"definition":"A tool that shows you which direction is north. Explorers use it to find their way.","phonetics":"KUM-pus","syllables":["com","pass"]}`;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const word = String(body?.word || '').trim();
  if (!word || word.length > 60) {
    return NextResponse.json({ error: 'Invalid word' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Not configured' }, { status: 500 });

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: word },
        ],
      }),
    });

    if (!res.ok) return NextResponse.json({ error: 'AI error' }, { status: 502 });
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';

    let parsed: any;
    try { parsed = JSON.parse(content); } catch {
      return NextResponse.json({ error: 'Parse error' }, { status: 502 });
    }

    return NextResponse.json({
      definition: String(parsed.definition || ''),
      phonetics: String(parsed.phonetics || ''),
      syllables: Array.isArray(parsed.syllables) ? parsed.syllables.map(String) : [word],
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
