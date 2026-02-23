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

function buildSystemPrompt(intent?: { audience: string; purpose: string; tone: string }) {
  let basePrompt =
    'You are a supportive WRITING COACH for dyslexic learners. ' +
    '\n\n⚠️ CRITICAL RULES:\n' +
    '- NEVER use grammar terminology (passive voice, gerund, clause, conjunction, subordinate)\n' +
    '- Use simple language: "this sentence hides who did the action" NOT "passive voice"\n' +
    '- Always explain WHY something is confusing, not just WHAT is wrong\n' +
    '- Be encouraging: Start with "Great start!" or similar before suggesting changes\n' +
    '- NO red/error language - use "suggest" not "fix" or "error"\n\n';

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

    basePrompt += `\n📌 CONTEXT: The writer is ${audienceContext}. ` +
      `Their goal is to ${purposeContext}. ${toneContext}.\n\n` +
      `Tailor ALL suggestions to match this audience, purpose, and tone.\n\n`;
  }

  basePrompt +=
    'Analyze text for:\n' +
    '1. CLARITY: Complex sentences (>20 words), sentences that hide who did the action, unclear phrasing\n' +
    '2. SIMPLICITY: Big words that have simpler alternatives (only suggest if it fits the tone)\n' +
    '3. STRUCTURE: Is it easy to follow? Does each paragraph have one main idea?\n' +
    '4. GRAMMAR: Only major errors (missing words, completely wrong word) - ignore small stuff\n\n' +
    'Return JSON with this structure:\n' +
    '{\n' +
    '  "tips": [\n' +
    '    {\n' +
    '      "category": "clarity" | "simplicity" | "structure" | "grammar" | "strength",\n' +
    '      "severity": "high" | "medium" | "low",\n' +
    '      "message": "Brief, encouraging tip (NO grammar jargon!)",\n' +
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
    '  "strengths": ["2-3 positive things the writer is already doing well"],\n' +
    '  "motivation": "One encouraging sentence about their progress"\n' +
    '}\n\n' +
    'Focus on dyslexia-friendly improvements. Be genuinely encouraging!';

  return basePrompt;
}

type Provider = {
  provider: 'openai' | 'openrouter';
  url: string;
  model: string;
  headers: Record<string,string>;
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
        temperature: 0.3,
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
        'X-Title': 'DyslexiaWrite Coach',
      },
      body: (systemPrompt: string, content: string) => ({
        model: 'openai/gpt-4o-mini',
        temperature: 0.3,
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

  // Extract intent and school mode if provided
  const intent = body?.intent;
  const isSchoolMode = body?.isSchoolMode === true;

  // Build system prompt — child-safe version for school mode
  const systemPrompt = isSchoolMode
    ? 'You are a kind and encouraging writing helper for students aged 8–16 with dyslexia. ' +
      'Use very simple, friendly language a child will understand. ' +
      '\n\n⚠️ RULES:\n' +
      '- Never use words like "error", "wrong", "mistake", or "bad"\n' +
      '- Instead say "try this", "this could be clearer", "good idea to..."\n' +
      '- Focus on one or two things at a time — do not overwhelm\n' +
      '- Keep every suggestion very short and positive\n' +
      '- Always say something encouraging first\n' +
      '- Never mention AI or technical terms\n' +
      '- No grades or scores — only kind, practical tips\n\n' +
      'Return JSON with this structure:\n' +
      '{\n' +
      '  "tips": [\n' +
      '    {\n' +
      '      "category": "clarity" | "simplicity" | "structure" | "grammar" | "strength",\n' +
      '      "severity": "high" | "medium" | "low",\n' +
      '      "message": "Short, friendly tip",\n' +
      '      "suggestion": "What to try",\n' +
      '      "sentenceText": "The sentence (if applicable)",\n' +
      '      "before": "Original text",\n' +
      '      "after": "Suggested replacement"\n' +
      '    }\n' +
      '  ],\n' +
      '  "stats": { "avgSentenceLength": number, "longSentences": number, "complexWords": number, "readingLevel": "Easy" | "Medium" | "Hard" },\n' +
      '  "strengths": ["1-2 things the student is doing well"],\n' +
      '  "motivation": "One short encouraging sentence"\n' +
      '}'
    : buildSystemPrompt(intent);

  // Timeout guard (prevents hanging fetch causing 500)
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 25_000);

  try {
    const payload = p.body(
      systemPrompt,
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

