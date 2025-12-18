// src/app/api/coach/rewrite-sentence/route.ts
import 'server-only';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- helpers ---------------------------------------------------------------

function cleanEnv(v?: string | null) {
  const s = (v || '').trim().replace(/^"(.*)"$/, '$1');
  return s;
}

const OPENAI_KEY = cleanEnv(process.env.OPENAI_API_KEY);
const OPENROUTER_KEY = cleanEnv(process.env.OPENROUTER_API_KEY);
const SITE_URL = cleanEnv(process.env.NEXT_PUBLIC_SITE_URL) || 'http://localhost:3000';

function buildRewritePrompt(intent?: { audience: string; purpose: string; tone: string }) {
  let basePrompt =
    'You are a helpful writing assistant for dyslexic users. ' +
    'Your job is to rewrite a selected sentence in 3 different ways.\n\n' +
    '⚠️ CRITICAL RULES:\n' +
    '- NEVER use grammar terminology\n' +
    '- Each rewrite should have a different goal\n' +
    '- Keep the core meaning intact\n' +
    '- Be genuinely helpful and encouraging\n\n';

  // Add intent context if provided
  if (intent) {
    const audienceContext = {
      friend: 'writing for a friend - keep it casual and warm',
      teacher: 'writing for a teacher - be clear and well-organized',
      boss: 'writing for a boss - be professional and direct',
      general: 'writing for anyone - make it easy for everyone to understand',
    }[intent.audience] || 'general audience';

    const purposeContext = {
      inform: 'help the reader understand something new',
      persuade: 'convince the reader to agree or take action',
      explain: 'give clear instructions the reader can follow',
      story: 'tell an engaging story the reader will enjoy',
    }[intent.purpose] || 'inform';

    const toneContext = {
      casual: 'Keep the tone casual and friendly, like texting',
      neutral: 'Keep the tone neutral - not too formal, not too casual',
      formal: 'Keep the tone formal and professional',
    }[intent.tone] || 'neutral';

    basePrompt += `📌 CONTEXT: The writer is ${audienceContext}. ` +
      `Their goal is to ${purposeContext}. ${toneContext}.\n\n` +
      `Tailor ALL rewrites to match this context.\n\n`;
  }

  basePrompt +=
    'Return JSON with exactly 3 alternatives:\n' +
    '{\n' +
    '  "alternatives": [\n' +
    '    {\n' +
    '      "label": "Simpler" | "More confident" | "More formal" | "Clearer" | "Shorter",\n' +
    '      "icon": "✨" | "💪" | "👔" | "💡" | "⚡",\n' +
    '      "text": "The rewritten sentence",\n' +
    '      "explanation": "Brief reason why this version is better (1 sentence)"\n' +
    '    }\n' +
    '  ]\n' +
    '}\n\n' +
    'Choose labels that fit the sentence. Vary your approach:\n' +
    '- Simpler: Use easier words, shorter structure\n' +
    '- More confident: Remove hedging words (maybe, might, sort of)\n' +
    '- More formal: Professional language\n' +
    '- Clearer: Make the meaning more obvious\n' +
    '- Shorter: Cut unnecessary words\n\n' +
    'Match the tone and audience from the context!';

  return basePrompt;
}

type Provider = {
  provider: 'openai' | 'openrouter';
  url: string;
  model: string;
  headers: Record<string, string>;
  body: (systemPrompt: string, content: string) => any;
  pickText: (rsp: Response) => Promise<string>;
};

function chooseProvider(): Provider | null {
  if (OPENAI_KEY && OPENAI_KEY.length > 20) {
    return {
      provider: 'openai',
      url: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o-mini',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: (systemPrompt: string, content: string) => ({
        model: 'gpt-4o-mini',
        temperature: 0.5,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content },
        ],
      }),
      pickText: async (rsp: Response) => {
        const j = await rsp.json();
        return j?.choices?.[0]?.message?.content || '';
      },
    };
  }
  if (OPENROUTER_KEY && OPENROUTER_KEY.length > 20) {
    return {
      provider: 'openrouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'openai/gpt-4o-mini',
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': SITE_URL,
        'X-Title': 'DyslexiaWrite Rewriter',
      },
      body: (systemPrompt: string, content: string) => ({
        model: 'openai/gpt-4o-mini',
        temperature: 0.5,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content },
        ],
      }),
      pickText: async (rsp: Response) => {
        const j = await rsp.json();
        return j?.choices?.[0]?.message?.content || '';
      },
    };
  }
  return null;
}

function jsonError(
  status: number,
  payload: any,
  extraHeaders?: Record<string, string>
) {
  return NextResponse.json(payload, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

// --- handlers --------------------------------------------------------------

export function GET() {
  const p = chooseProvider();
  return new Response('SentenceRewriter OK', {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
      'x-api-provider': p?.provider || 'none',
      'x-api-key-present': p ? 'true' : 'false',
    },
  });
}

export async function POST(req: NextRequest) {
  const p = chooseProvider();
  const baseHdrs: Record<string, string> = {
    'Cache-Control': 'no-store',
    'x-api-provider': p?.provider || 'none',
  };

  if (!p) {
    return jsonError(500, {
      error: 'NO_PROVIDER',
      detail:
        'Set OPENAI_API_KEY or OPENROUTER_API_KEY in .env.local and restart the dev server.',
    }, baseHdrs);
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return jsonError(400, { error: 'BAD_JSON' }, baseHdrs);
  }

  const sentence = String(body?.sentence || '').trim();
  if (!sentence) {
    return jsonError(400, { error: 'MISSING_SENTENCE' }, baseHdrs);
  }

  // Extract intent if provided
  const intent = body?.intent;

  // Build system prompt with intent context
  const systemPrompt = buildRewritePrompt(intent);

  // Timeout guard
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 25_000);

  try {
    const payload = p.body(
      systemPrompt,
      `Selected sentence:\n"""${sentence}"""\n\nPlease provide 3 alternative rewrites in the exact JSON format.`
    );

    const rsp = await fetch(p.url, {
      method: 'POST',
      headers: p.headers,
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    }).catch((e) => {
      throw new Error(`FETCH_FAIL: ${e?.message || e}`);
    });

    clearTimeout(to);

    baseHdrs['x-provider-status'] = String(rsp.status);
    baseHdrs['x-provider-model'] = p.model;

    if (!rsp.ok) {
      let detail: any = null;
      try {
        detail = await rsp.json();
      } catch {
        try {
          detail = (await rsp.text()).slice(0, 400);
        } catch {
          detail = 'No provider body';
        }
      }
      return jsonError(502, {
        error: 'PROVIDER_ERROR',
        providerStatus: rsp.status,
        providerStatusText: rsp.statusText,
        detail,
      }, baseHdrs);
    }

    const content = await p.pickText(rsp);
    const safe = (content || '').trim();

    if (!safe) {
      return jsonError(502, {
        error: 'EMPTY',
        detail: 'Provider returned no content.',
      }, baseHdrs);
    }

    return new Response(safe, {
      status: 200,
      headers: {
        ...baseHdrs,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (e: any) {
    clearTimeout(to);
    return jsonError(500, {
      error: 'INTERNAL',
      detail: e?.message || String(e),
      hints: [
        'Check that your OPENAI_API_KEY or OPENROUTER_API_KEY is set and valid.',
        'If you just edited .env.local, stop and restart `next dev`.',
      ],
    }, baseHdrs);
  }
}
