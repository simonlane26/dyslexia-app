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

function cleanEnv(v?: string | null) {
  return (v || '').trim().replace(/^"(.*)"$/, '$1');
}

const OPENAI_KEY = cleanEnv(process.env.OPENAI_API_KEY);
const OPENROUTER_KEY = cleanEnv(process.env.OPENROUTER_API_KEY);
const SITE_URL = cleanEnv(process.env.NEXT_PUBLIC_SITE_URL) || 'https://www.dyslexiawrite.com';

type Provider = { name: 'openai' | 'openrouter'; url: string; model: string; headers: Record<string, string> };

function providers(): Provider[] {
  const list: Provider[] = [];
  if (OPENAI_KEY.length > 20) {
    list.push({
      name: 'openai',
      url: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o-mini',
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    });
  }
  if (OPENROUTER_KEY.length > 20) {
    list.push({
      name: 'openrouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'openai/gpt-4o-mini',
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': SITE_URL,
        'X-Title': 'DyslexiaWrite',
      },
    });
  }
  return list;
}

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

  const candidates = providers();
  if (candidates.length === 0) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  // Try each configured provider in turn (OpenAI first, OpenRouter as fallback)
  // so a single exhausted account doesn't take the whole feature down.
  let lastError: { status: number; message: string } | null = null;

  for (const provider of candidates) {
    try {
      const res = await fetch(provider.url, {
        method: 'POST',
        headers: provider.headers,
        body: JSON.stringify({
          model: provider.model,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: word },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(`[word-info] ${provider.name} request failed`, res.status, errText.slice(0, 500));
        let providerMessage = errText.slice(0, 300);
        try { providerMessage = JSON.parse(errText)?.error?.message || providerMessage; } catch {}
        lastError = { status: res.status, message: providerMessage };
        continue; // try the next provider, if any
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || '';

      let parsed: any;
      try { parsed = JSON.parse(content); } catch {
        // gpt-4o-mini occasionally wraps output in ```json fences despite
        // instructions not to — strip them before giving up.
        try {
          parsed = JSON.parse(content.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim());
        } catch {
          console.error('[word-info] Could not parse model output:', content.slice(0, 500));
          lastError = { status: 502, message: 'Could not parse the response' };
          continue;
        }
      }

      return NextResponse.json({
        definition: String(parsed.definition || ''),
        phonetics: String(parsed.phonetics || ''),
        syllables: Array.isArray(parsed.syllables) ? parsed.syllables.map(String) : [word],
      });
    } catch (e: any) {
      console.error(`[word-info] ${provider.name} server error:`, e?.message || e);
      lastError = { status: 500, message: e?.message || 'Server error' };
    }
  }

  return NextResponse.json(
    { error: 'AI error', providerStatus: lastError?.status ?? 502, providerMessage: lastError?.message },
    { status: 502 }
  );
}
