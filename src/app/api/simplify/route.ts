import 'server-only';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Provider = 'openai' | 'openrouter' | 'none';
// compat shim: works with both shapes of clerkClient
async function getClerkClient() {
  const anyClient = clerkClient as unknown as any;
  return typeof anyClient === 'function' ? await anyClient() : anyClient;
}

const SYSTEM_PROMPT =
  'You simplify text for dyslexic readers. Keep meaning the same; prefer short sentences and simple words. Remove filler. Keep names and facts. Output only the simplified text.';

// ---------- utils
const clean = (s?: string | null) => (s ?? '').trim().replace(/^"(.*)"$/, '$1');
const todayStr = () => new Date().toISOString().split('T')[0];

function getSiteOrigin(): string {
  const fromEnv = clean(process.env.NEXT_PUBLIC_SITE_URL) || clean(process.env.SITE_URL);
  if (fromEnv) return fromEnv;
  const vercel = clean(process.env.VERCEL_URL);
  if (vercel) return `https://${vercel}`;
  return 'https://www.dyslexiawrite.com';
}

function pickProvider(): { provider: Provider; key: string; url?: string; model?: string } {
  const oa = clean(process.env.OPENAI_API_KEY);
  const or = clean(process.env.OPENROUTER_API_KEY);

  if (oa) {
    return {
      provider: 'openai',
      key: oa,
      url: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o-mini',
    };
  }
  if (or) {
    return {
      provider: 'openrouter',
      key: or,
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'openai/gpt-4o-mini',
    };
  }
  return { provider: 'none', key: '' };
}

// ---------- simple in-memory quota (resets on deploy)
const dailyUsage = new Map<string, { count: number; date: string }>();

// ---------- handlers
export async function OPTIONS() {
  // same-origin requests don’t need CORS, but this makes preflight harmless
  return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const H: Record<string, string> = { 'Cache-Control': 'no-store', 'x-runtime': 'node' };

  try {
    // 1) auth (401 JSON, never redirect)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: H });
    }

    // 2) body
    if (!(req.headers.get('content-type') || '').includes('application/json')) {
      return NextResponse.json({ error: 'Send JSON: { "text": "..." }' }, { status: 415, headers: H });
    }
    const body = await req.json().catch(() => null as any);
    const text = String(body?.text ?? '').trim();
    if (!text) {
      return NextResponse.json({ error: "Missing 'text' string" }, { status: 400, headers: H });
    }

    // 3) provider + key
    const sel = pickProvider();
    H['x-api-provider'] = sel.provider;
    H['x-key-present'] = String(Boolean(sel.key));
    H['x-key-prefix'] = sel.key ? sel.key.slice(0, 5) : '';
    H['x-key-len'] = sel.key ? String(sel.key.length) : '0';
    if (sel.provider === 'none') {
      return NextResponse.json(
        { error: 'NO_PROVIDER_KEY', detail: 'Set OPENAI_API_KEY or OPENROUTER_API_KEY' },
        { status: 500, headers: H }
      );
    }
    H['x-model'] = sel.model!;

    // 4) pro check (non-fatal if fails)
    let isPro = false;
    try {
      const client = await getClerkClient();
      const user = await client.users.getUser(userId);
      isPro =
        (user.publicMetadata as any)?.isPro === true ||
        (user.unsafeMetadata as any)?.isPro === true;
    } catch {
      /* ignore */
    }
    H['x-pro'] = String(isPro);

    // 5) free quota
    let newCount = 0;
    if (!isPro) {
      const today = todayStr();
      const rec = dailyUsage.get(userId);
      const current = rec && rec.date === today ? rec.count : 0;
      if (current >= 5) {
        return NextResponse.json(
          { error: 'Daily limit reached (5/5). Upgrade to Pro for unlimited use.' },
          { status: 429, headers: H }
        );
      }
      newCount = current + 1;
      dailyUsage.set(userId, { count: newCount, date: today });
    }

    // 6) upstream call (fetch)
    const payload = {
      model: sel.model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
    };

    const headers: Record<string, string> = {
      Authorization: `Bearer ${sel.key}`,
      'Content-Type': 'application/json',
    };

    if (sel.provider === 'openrouter') {
      headers['HTTP-Referer'] = getSiteOrigin();
      headers['X-Title'] = 'DyslexiaWrite';
    }

    const upstream = await fetch(sel.url!, { method: 'POST', headers, body: JSON.stringify(payload) });
    H['x-upstream-status'] = String(upstream.status);
    H['x-upstream-ok'] = String(upstream.ok);

    const ctype = upstream.headers.get('content-type') || '';
    const raw = await upstream.text();
    const data = ctype.includes('application/json')
      ? (() => { try { return JSON.parse(raw); } catch { return { raw }; } })()
      : { raw };

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: 'PROVIDER_ERROR',
          providerStatus: upstream.status,
          providerStatusText: upstream.statusText,
          detail: data,
        },
        { status: 502, headers: H }
      );
    }

    const simplified =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.message?.text ??
      data?.choices?.[0]?.text ?? '';

    if (!simplified || !String(simplified).trim()) {
      return NextResponse.json({ error: 'EMPTY_RESPONSE', detail: data }, { status: 502, headers: H });
    }

    return NextResponse.json(
      {
        simplifiedText: String(simplified).trim(),
        usage: { count: isPro ? 0 : newCount, limit: isPro ? 'Unlimited' : 5, isPro },
      },
      { headers: H }
    );
  } catch (e: any) {
    H['x-upstream-ok'] = 'false';
    return NextResponse.json({ error: 'INTERNAL', detail: e?.message || String(e) }, { status: 500, headers: H });
  }
}

export function GET() {
  return NextResponse.json({ message: 'Simplify API is working' }, { headers: { 'Cache-Control': 'no-store' } });
}
