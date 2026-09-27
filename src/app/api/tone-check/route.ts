// src/app/api/tone-check/route.ts
import 'server-only';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';

const FREE_DAILY_LIMIT = 200;

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

const SYSTEM_PROMPT = `You are a tone advisor for a dyslexic user who wants to know how their message comes across.

IMPORTANT:
- Casual and friendly tones are GOOD — do not suggest being more formal
- Only flag tone as a problem if the message is genuinely blunt, aggressive, or confusing
- The user is dyslexic — their phrasing might sound unusual but still be completely fine
- Never make them feel like their natural voice is wrong

Analyse the message and respond ONLY with valid JSON (no markdown, no code blocks):
{
  "tone": "friendly" | "professional" | "casual" | "formal" | "blunt" | "apologetic" | "unclear",
  "confidence": "sounds great" | "mostly good" | "might need adjusting",
  "summary": "One sentence describing how it reads (max 15 words)",
  "suggestion": "One sentence of advice, or null if nothing to improve",
  "rewrite": "A friendlier rewritten version ONLY if tone is blunt or unclear, otherwise null"
}`;

function jsonError(status: number, payload: any) {
  return NextResponse.json(payload, {
    status,
    headers: { 'Cache-Control': 'no-store', ...CORS_HEADERS },
  });
}

export async function POST(req: NextRequest) {
  if (!OPENAI_KEY || OPENAI_KEY.length < 20) return jsonError(500, { error: 'NO_API_KEY' });

  let body: any = {};
  try { body = await req.json(); } catch { return jsonError(400, { error: 'BAD_JSON' }); }

  const text = String(body?.text || '').trim();
  if (!text || text.length < 10) return jsonError(400, { error: 'TOO_SHORT' });
  if (text.length > 3000) return jsonError(400, { error: 'TOO_LONG' });

  // Auth — accept either a Clerk session (web app) or extension JWT token;
  // resolve both to a single userId + isPro so rate limiting is consistent.
  const authHeader = req.headers.get('authorization') ?? '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const secret = getExtensionSecret();

  let userId: string | null = null;
  let isPro = false;

  if (bearerToken) {
    if (!secret) return jsonError(401, { error: 'SIGN_IN_REQUIRED' });
    try {
      const { payload } = await jwtVerify(bearerToken, secret);
      userId = (payload.userId as string) ?? null;
    } catch {
      return jsonError(401, { error: 'INVALID_TOKEN' });
    }
    if (!userId) return jsonError(401, { error: 'SIGN_IN_REQUIRED' });
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      isPro = (user.publicMetadata as any)?.isPro === true;
    } catch {
      isPro = false;
    }
  } else {
    const session = await auth();
    userId = session.userId ?? null;
    if (!userId) return jsonError(401, { error: 'SIGN_IN_REQUIRED' });
    const meta = (session.sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;
    isPro = meta.isPro === true;
  }

  // Free tier: FREE_DAILY_LIMIT/day (generous — anti-abuse ceiling rather
  // than a business-tier restriction), claimed atomically up front. Pro is
  // unlimited. Refunded below if the provider call fails.
  const today = new Date().toISOString().split('T')[0];
  const db = !isPro ? createSupabaseServerClient() : null;

  if (db) {
    const { data: claimed, error: claimErr } = await db.rpc('try_increment_api_usage', {
      p_user_id: userId,
      p_feature: 'tone_check',
      p_date: today,
      p_limit: FREE_DAILY_LIMIT,
    });

    if (claimErr) {
      console.error('[tone-check] usage claim error:', claimErr);
      return jsonError(500, { error: 'INTERNAL' });
    }
    if (typeof claimed !== 'number') {
      return jsonError(429, { error: 'LIMIT_REACHED', message: `Daily limit reached (${FREE_DAILY_LIMIT}/${FREE_DAILY_LIMIT}).` });
    }
  }

  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 20_000);

  try {
    const rsp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 400,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
      }),
      signal: ctrl.signal,
    });

    clearTimeout(to);
    if (!rsp.ok) {
      if (db) void db.rpc('refund_api_usage', { p_user_id: userId, p_feature: 'tone_check', p_date: today });
      return jsonError(502, { error: 'PROVIDER_ERROR', status: rsp.status });
    }

    const j = await rsp.json();
    const content = (j?.choices?.[0]?.message?.content || '').trim();

    let result: any = {};
    try {
      const clean = content.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
      result = JSON.parse(clean);
    } catch {
      if (db) void db.rpc('refund_api_usage', { p_user_id: userId, p_feature: 'tone_check', p_date: today });
      return jsonError(502, { error: 'PARSE_ERROR' });
    }

    return NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'no-store', ...CORS_HEADERS },
    });
  } catch (e: any) {
    clearTimeout(to);
    console.error('[tone-check] internal error', e);
    if (db) void db.rpc('refund_api_usage', { p_user_id: userId, p_feature: 'tone_check', p_date: today });
    return jsonError(500, { error: 'INTERNAL' });
  }
}
