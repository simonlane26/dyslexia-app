// src/app/api/simplify-page/route.ts
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

const LEVEL_INSTRUCTIONS: Record<number, string> = {
  1: 'LEVEL 1 (Light touch): Fix jargon and shorten very long sentences only. Keep vocabulary and style mostly the same.',
  2: 'LEVEL 2 (Plain English): Rewrite in plain English. Use short sentences (under 15 words). Use common, everyday words.',
  3: 'LEVEL 3 (Very simple): Use very simple language. Short words, very short sentences. Explain any technical terms.',
};

const CONTEXT_ADDITIONS: Record<string, string> = {
  government: 'This is an official/government document. Keep all legal requirements, deadlines, amounts, reference numbers, and dates exactly as they are. Add brief plain-language explanations for legal terms in brackets.',
  medical: 'This is medical content. Keep all medical terms but add simple explanations in brackets. Keep all dosages, warnings, and instructions exactly.',
  financial: 'This is financial content. Keep all figures, percentages, and amounts accurate. Convert financial jargon to plain English.',
  legal: 'This is legal content. Keep all legal terms but explain them simply. Never remove obligations, rights, or deadlines.',
  general: '',
};

function buildSystemPrompt(level: number, pageType: string): string {
  const clampedLevel = Math.min(Math.max(Math.round(level), 1), 3);
  const levelInstr = LEVEL_INSTRUCTIONS[clampedLevel];
  const contextInstr = CONTEXT_ADDITIONS[pageType] || '';

  return `You are a text simplification engine for people with dyslexia.

${levelInstr}
${contextInstr ? '\n' + contextInstr + '\n' : ''}
RULES:
- Keep the EXACT same meaning — never add information that isn't there
- Never remove dates, names, amounts, deadlines, or reference numbers
- Replace passive voice with active voice where possible
- IMPORTANT: Always respond in the same language as the input text

FORMATTING:
- The input contains paragraphs marked [P0], [P1], [P2], etc.
- Return ONLY the simplified paragraphs, each prefixed with [P0], [P1], etc.
- Do not add any other text or commentary
- Match the exact count of input paragraphs

EXAMPLE INPUT:
[P0]
Pursuant to Section 21 of the Housing Act 1988, the landlord hereby gives notice requiring possession of the dwelling-house situated at the address stated below after the date specified in this notice.

EXAMPLE OUTPUT:
[P0]
Your landlord is asking you to leave your home. This is a legal notice called a Section 21. It means they want you to move out by the date shown. This is allowed under the Housing Act 1988.`;
}

function jsonError(status: number, payload: any) {
  return NextResponse.json(payload, {
    status,
    headers: { 'Cache-Control': 'no-store', ...CORS_HEADERS },
  });
}

export async function POST(req: NextRequest) {
  // Auth — accept extension JWT or Clerk session
  const authHeader = req.headers.get('authorization') ?? '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const secret = getExtensionSecret();

  if (bearerToken) {
    if (secret) {
      try {
        await jwtVerify(bearerToken, secret);
      } catch {
        return jsonError(401, { error: 'INVALID_TOKEN' });
      }
    }
  } else {
    const { userId } = await auth();
    if (!userId) {
      return jsonError(401, { error: 'SIGN_IN_REQUIRED' });
    }
  }

  if (!OPENAI_KEY || OPENAI_KEY.length < 20) {
    return jsonError(500, { error: 'NO_API_KEY' });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return jsonError(400, { error: 'BAD_JSON' });
  }

  const text = String(body?.text || '').trim();
  const level = Number(body?.level) || 2;
  const pageType = String(body?.pageType || 'general');

  if (!text) return jsonError(400, { error: 'MISSING_TEXT' });
  if (text.length > 8000) return jsonError(400, { error: 'TOO_LONG', max: 8000 });

  const systemPrompt = buildSystemPrompt(level, pageType);

  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 35_000);

  try {
    const rsp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
      }),
      signal: ctrl.signal,
    });

    clearTimeout(to);

    if (!rsp.ok) {
      let detail: any = null;
      try { detail = await rsp.json(); } catch { /* empty */ }
      return jsonError(502, { error: 'PROVIDER_ERROR', status: rsp.status, detail });
    }

    const j = await rsp.json();
    const content: string = j?.choices?.[0]?.message?.content || '';
    if (!content) return jsonError(502, { error: 'EMPTY_RESPONSE' });

    // Parse [P0], [P1], ... markers
    const simplified: string[] = [];
    const parts = content.split(/\[P\d+\]/);
    for (let i = 1; i < parts.length; i++) {
      simplified.push(parts[i].trim());
    }

    return NextResponse.json({ simplified }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store', ...CORS_HEADERS },
    });
  } catch (e: any) {
    clearTimeout(to);
    console.error('[simplify-page] internal error', e);
    return jsonError(500, { error: 'INTERNAL' });
  }
}
