// src/app/api/check-message/route.ts
import 'server-only';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { auth } from '@clerk/nextjs/server';

function getExtensionSecret() {
  const s = process.env.EXTENSION_TOKEN_SECRET;
  if (!s) return null;
  return new TextEncoder().encode(s);
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store', ...CORS_HEADERS } });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function cleanEnv(v?: string | null) {
  return (v || '').trim().replace(/^"(.*)"$/, '$1');
}

const OPENAI_KEY = cleanEnv(process.env.OPENAI_API_KEY);

const SYSTEM_PROMPT = `You are a gentle writing assistant for people with dyslexia.

YOUR JOB: Check for genuine mistakes only — homophones, spelling errors, missing words, or genuinely unclear sentences.

STRICT RULES:
- Do NOT flag informal style. "Hi Sarah" instead of "Dear Sarah" is perfectly fine.
- Do NOT flag casual grammar that's normal in emails and messages.
- Do NOT flag personal writing voice or unusual-but-clear phrasing.
- Do NOT suggest being more formal.
- ONLY flag: homophones (their/there/they're, your/you're, its/it's, to/too/two, then/than, were/we're, of/have), common spelling mistakes, words that are clearly wrong, sentences that don't make sense.
- Max 6 suggestions per response.
- Never use grammar jargon. Keep reasons short and friendly (under 8 words).
- If the text reads fine, return an empty array.

IMPORTANT: The user is dyslexic. Their phrasing might sound a little different but still be completely clear and correct. Do not penalise their natural voice.

Respond ONLY with a valid JSON array (no markdown, no code blocks):
[{"original": "exact text to replace", "suggestion": "corrected version", "reason": "short friendly reason"}]

If nothing needs fixing, respond with exactly: []`;

function jsonError(status: number, payload: any) {
  return NextResponse.json(payload, {
    status,
    headers: { 'Cache-Control': 'no-store', ...CORS_HEADERS },
  });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const secret = getExtensionSecret();

  if (bearerToken) {
    if (secret) {
      try { await jwtVerify(bearerToken, secret); }
      catch { return jsonError(401, { error: 'INVALID_TOKEN' }); }
    }
  } else {
    const { userId } = await auth();
    if (!userId) return jsonError(401, { error: 'SIGN_IN_REQUIRED' });
  }

  if (!OPENAI_KEY || OPENAI_KEY.length < 20) return jsonError(500, { error: 'NO_API_KEY' });

  let body: any = {};
  try { body = await req.json(); } catch { return jsonError(400, { error: 'BAD_JSON' }); }

  const text = String(body?.text || '').trim();
  const userPatterns: Array<{ original: string; correction: string }> = body?.userPatterns || [];

  if (!text || text.length < 10) return NextResponse.json({ suggestions: [] }, { status: 200, headers: { 'Cache-Control': 'no-store', ...CORS_HEADERS } });
  if (text.length > 3000) return jsonError(400, { error: 'TOO_LONG' });

  let systemPrompt = SYSTEM_PROMPT;
  if (userPatterns.length > 0) {
    const patternList = userPatterns.slice(0, 10).map(p => `"${p.original}" → "${p.correction}"`).join(', ');
    systemPrompt += `\n\nThis user often confuses: ${patternList}. Watch for these especially.`;
  }

  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 20_000);

  try {
    const rsp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        max_tokens: 400,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
      }),
      signal: ctrl.signal,
    });

    clearTimeout(to);
    if (!rsp.ok) return jsonError(502, { error: 'PROVIDER_ERROR', status: rsp.status });

    const j = await rsp.json();
    const content = (j?.choices?.[0]?.message?.content || '').trim();

    let suggestions: any[] = [];
    try {
      const clean = content.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
      suggestions = JSON.parse(clean);
      if (!Array.isArray(suggestions)) suggestions = [];
    } catch { suggestions = []; }

    return NextResponse.json({ suggestions }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store', ...CORS_HEADERS },
    });
  } catch (e: any) {
    clearTimeout(to);
    return jsonError(500, { error: 'INTERNAL', detail: e?.message });
  }
}
