// src/app/api/coach/route.ts
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

const SYSTEM_PROMPT =
  'You are a supportive WRITING COACH for dyslexic learners. ' +
  'Analyze text for:\n' +
  '1. CLARITY: Complex sentences (>20 words), passive voice, unclear phrasing\n' +
  '2. SIMPLICITY: Complex words that have simpler alternatives\n' +
  '3. STRUCTURE: Paragraph organization, flow, transitions\n' +
  '4. GRAMMAR: Basic errors (not nitpicky)\n\n' +
  'Return JSON with this structure:\n' +
  '{\n' +
  '  "tips": [\n' +
  '    {\n' +
  '      "category": "clarity" | "simplicity" | "structure" | "grammar" | "strength",\n' +
  '      "severity": "high" | "medium" | "low",\n' +
  '      "message": "Brief, encouraging tip",\n' +
  '      "suggestion": "Specific improvement to make",\n' +
  '      "sentenceText": "The actual sentence with the issue (if applicable)",\n' +
  '      "before": "Original problematic text",\n' +
  '      "after": "Suggested replacement"\n' +
  '    }\n' +
  '  ],\n' +
  '  "stats": {\n' +
  '    "avgSentenceLength": number,\n' +
  '    "longSentences": number,\n' +
  '    "complexWords": number,\n' +
  '    "readingLevel": "Easy" | "Medium" | "Hard"\n' +
  '  },\n' +
  '  "strengths": ["2-3 positive things"],\n' +
  '  "motivation": "One encouraging sentence"\n' +
  '}\n\n' +
  'Focus on dyslexia-friendly improvements. Be encouraging!';

type Provider = {
  provider: 'openai' | 'openrouter';
  url: string;
  model: string;
  headers: Record<string,string>;
  body: (content: string) => any;
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
      body: (content: string) => ({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
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
        'X-Title': 'DyslexiaWrite Coach',
      },
      body: (content: string) => ({
        model: 'openai/gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
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

// unified error helper (adds debug headers)
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
  return new Response('WritingCoach OK', {
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

  // Fast checks (these often cause 500s if missing)
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

  const text = String(body?.text || '').trim();
  if (!text) {
    return jsonError(400, { error: 'MISSING_TEXT' }, baseHdrs);
  }

  // Timeout guard (prevents hanging fetch causing 500)
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 25_000);

  try {
    const payload = p.body(
      `Student draft:\n"""\n${text}\n"""\n\nPlease respond in the exact format.`
    );

    const rsp = await fetch(p.url, {
      method: 'POST',
      headers: p.headers,
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    }).catch((e) => {
      // network-level error
      throw new Error(`FETCH_FAIL: ${e?.message || e}`);
    });

    clearTimeout(to);

    baseHdrs['x-provider-status'] = String(rsp.status);
    baseHdrs['x-provider-model'] = p.model;

    if (!rsp.ok) {
      // Try JSON, then text
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
    // Surface useful info to the browser for quick debugging
    return jsonError(500, {
      error: 'INTERNAL',
      detail: e?.message || String(e),
      hints: [
        'Check that your OPENAI_API_KEY or OPENROUTER_API_KEY is set and valid.',
        'If you just edited .env.local, stop and restart `next dev`.',
        'Ensure NEXT_PUBLIC_SITE_URL is set when using OpenRouter (used as Referer).',
      ],
    }, baseHdrs);
  }
}

