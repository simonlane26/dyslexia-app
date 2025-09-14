// src/app/api/text-to-speech/route.ts
import 'server-only';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- Voice config -----------------------------------------------------------
const DEFAULT_VOICE_ID = 'ZT9u07TYPVl83ejeLakq'; // Rachelle
const MODEL_ID = 'eleven_multilingual_v2';

const VOICE_MAP: Record<string, string> = {
  rachelle: DEFAULT_VOICE_ID,
  // liam: 'pNInz6obpgDQGcFmaJgB',
  // molli: 'EXAVITQu4vr4xnSDxMaL',
};

function resolveVoiceId(input?: string): string {
  if (!input) return DEFAULT_VOICE_ID;
  const k = input.trim().toLowerCase();
  return VOICE_MAP[k] || input;
}

// --- Handlers ---------------------------------------------------------------
export function GET() {
  return new Response('Text-to-Speech OK', { status: 200 });
}

export async function POST(req: NextRequest) {
  // 1) Env (trim to avoid accidental spaces/quotes)
  let apiKey = process.env.ELEVENLABS_API_KEY?.trim() || '';
  apiKey = apiKey.replace(/^"(.*)"$/, '$1'); // strip surrounding quotes if present
  if (!apiKey) {
    console.error('❌ ELEVENLABS_API_KEY missing. Add it to env and redeploy.');
    return NextResponse.json({ error: 'MISSING_API_KEY' }, { status: 500 });
  }

  // 2) Auth (be tolerant in dev if middleware is off)
  let userId: string | null = null;
  try {
    const a = await auth();
    userId = a?.userId ?? null;
  } catch (e) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ auth() failed in production:', (e as any)?.message || e);
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    // In dev, continue as free user
  }

  // 3) Parse body
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'BAD_JSON' }, { status: 400 });
  }

  const text = String(body?.text ?? '').trim();
  if (!text) return NextResponse.json({ error: 'MISSING_TEXT' }, { status: 400 });

  const requested = (body?.voiceId as string) || (body?.voice as string) || DEFAULT_VOICE_ID;

  // 4) Determine Pro (only if signed in)
  let isPro = false;
  if (userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const pub = (user.publicMetadata as any) ?? {};
      const unsafe = (user.unsafeMetadata as any) ?? {};
      const priv = (user as any).privateMetadata ?? {}; // may be present on server
      isPro = pub.isPro === true || unsafe.isPro === true || priv.isPro === true;
    } catch {
      isPro = false; // default safe
    }
  }

  // 5) Choose voice (Pro can use request; free forced to default)
  const chosenVoiceId = isPro ? resolveVoiceId(requested) : DEFAULT_VOICE_ID;

  // 6) Call ElevenLabs (stream endpoint for lower latency)
  const makeUrl = (voice: string) =>
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
      voice
    )}/stream?optimize_streaming_latency=3`;

  const payload = {
    model_id: MODEL_ID,
    text,
    voice_settings: {
      stability: 0.4,
      similarity_boost: 0.8,
      style: 0.0,
      use_speaker_boost: true,
    },
  };

  async function callTTS(voice: string) {
    return fetch(makeUrl(voice), {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey, // exact header expected by ElevenLabs
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify(payload),
    });
  }

  try {
    // First try chosen voice
    let r = await callTTS(chosenVoiceId);

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      const retriable =
        (r.status === 404 || r.status === 429) && chosenVoiceId !== DEFAULT_VOICE_ID;

      if (retriable) {
        // Fallback to default stock voice
        const fallback = await callTTS(DEFAULT_VOICE_ID);
        if (!fallback.ok) {
          const d2 = await fallback.text().catch(() => '');
          console.error(
            '❌ ElevenLabs fallback error:',
            fallback.status,
            fallback.statusText,
            d2.slice(0, 400)
          );
          return NextResponse.json(
            {
              error: 'PROVIDER_ERROR',
              providerStatus: fallback.status,
              providerStatusText: fallback.statusText,
              detail: d2.slice(0, 400),
            },
            { status: 502 }
          );
        }
        return new Response(fallback.body, {
          status: 200,
          headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
        });
      }

      console.error(
        '❌ ElevenLabs error:',
        r.status,
        r.statusText,
        detail.slice(0, 400)
      );
      return NextResponse.json(
        {
          error: 'PROVIDER_ERROR',
          providerStatus: r.status,
          providerStatusText: r.statusText,
          detail: detail.slice(0, 400),
        },
        { status: 502 }
      );
    }

    // Success → stream back MP3
    return new Response(r.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    console.error('❌ TTS route failure:', e?.message || e);
    return NextResponse.json({ error: 'INTERNAL' }, { status: 500 });
  }
}

