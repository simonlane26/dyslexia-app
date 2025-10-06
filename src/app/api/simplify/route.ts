import 'server-only';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory daily usage (resets on server restart)
const dailyUsage = new Map<string, { count: number; date: string }>();
const todayStr = () => new Date().toISOString().split('T')[0];

const SYSTEM_PROMPT =
  'You simplify text for dyslexic readers. Keep meaning the same; prefer short sentences and simple words. Remove filler. Keep names and facts. Output only the simplified text.';

// --- helpers -------------------------------------------------------
function clean(s?: string | null) {
  return (s || '').trim().replace(/^"(.*)"$/, '$1');
}
type Provider = 'openai' | 'openrouter' | null;

function pickProvider(): { provider: Provider; key: string } {
  const openai = clean(process.env.OPENAI_API_KEY);
  const or = clean(process.env.OPENROUTER_API_KEY);
  if (openai) return { provider: 'openai', key: openai };
  if (or) return { provider: 'openrouter', key: or };
  return { provider: null, key: '' };
}

// --- route handlers ------------------------------------------------
export async function POST(req: NextRequest) {
  // Prepare debug headers early so they are ALWAYS present
  const H: Record<string, string> = { 'Cache-Control': 'no-store' };

  try {
    // 1) Auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: H });
    }

    // 2) Body
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: H });
    }
    const text = String(body?.text ?? '').trim();
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400, headers: H });
    }

    // 3) Provider + key
    const { provider, key } = pickProvider();
    H['x-api-provider'] = provider ?? 'none';
    H['x-key-present'] = String(Boolean(key));
    H['x-key-prefix'] = key ? key.slice(0, 5) : 'null';
    H['x-key-len'] = key ? String(key.length) : '0';

    if (!provider || !key) {
      return NextResponse.json(
        { error: 'NO_PROVIDER_KEY', detail: 'Set OPENAI_API_KEY or OPENROUTER_API_KEY on the server.' },
        { status: 500, headers: H }
      );
    }

    // 4) Clerk Pro check
    let isPro = false;
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      isPro =
        (user.publicMetadata as any)?.isPro === true ||
        (user.unsafeMetadata as any)?.isPro === true;
    } catch {
      isPro = false;
    }
    H['x-pro'] = String(isPro);

    // 5) Daily quota for free users
    let newCount = 0;
    if (!isPro) {
      const today = todayStr();
      const rec = dailyUsage.get(userId);
      const current = rec && rec.date === today ? rec.count : 0;
      if (current >= 5) {
        return NextResponse.json(
          {
            error: 'Daily limit reached (5/5). Upgrade to Pro for unlimited simplifications.',
            usage: { count: current, limit: 5, isPro: false },
          },
          { status: 429, headers: H }
        );
      }
      newCount = current + 1;
      dailyUsage.set(userId, { count: newCount, date: today });
    }

    // 6) Upstream request (no SDK)
    const model = provider === 'openai' ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';
    H['x-model'] = model;

    const url =
      provider === 'openai'
        ? 'https://api.openai.com/v1/chat/completions'
        : 'https://openrouter.ai/api/v1/chat/completions';

    const reqHeaders: Record<string, string> = {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
    if (provider === 'openrouter') {
      // Required by OpenRouter ToS for client identification
      reqHeaders['HTTP-Referer'] = 'http://localhost:3000';
      reqHeaders['X-Title'] = 'DW Simplify';
    }

    const payload = {
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
    };

    const upstream = await fetch(url, {
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify(payload),
    });

    H['x-upstream-status'] = String(upstream.status);
    H['x-upstream-ok'] = String(upstream.ok);

    const ct = upstream.headers.get('content-type') || '';
    const raw = await upstream.text();
    const data = ct.includes('application/json')
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

    const simplifiedText =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.message?.text ??
      data?.choices?.[0]?.text ??
      '';

    if (!simplifiedText || !String(simplifiedText).trim()) {
      return NextResponse.json(
        { error: 'EMPTY_RESPONSE', detail: data },
        { status: 502, headers: H }
      );
    }

    return NextResponse.json(
      {
        simplifiedText: String(simplifiedText).trim(),
        usage: {
          count: isPro ? 0 : newCount,
          limit: isPro ? 'Unlimited' : 5,
          isPro,
        },
      },
      { status: 200, headers: H }
    );
  } catch (e: any) {
    // Last-ditch error — still return headers
    return NextResponse.json(
      { error: 'INTERNAL', detail: e?.message || String(e) },
      { status: 500, headers: H }
    );
  }
}

export function GET() {
  return NextResponse.json(
    { message: 'Simplify API is working' },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
