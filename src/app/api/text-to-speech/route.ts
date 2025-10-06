// src/app/api/text-to-speech/route.ts
import 'server-only';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_VOICE_ID = 'ZT9u07TYPVl83ejeLakq'; // e.g. Rachelle
const MODEL_ID = 'eleven_multilingual_v2';

const VOICE_MAP: Record<string, string> = {
  rachelle: DEFAULT_VOICE_ID,
  // add friendly names if you want: 'liam': 'wUwsnXivqGrDWuz1Fc89'
};

function resolveVoiceId(input?: string) {
  if (!input) return DEFAULT_VOICE_ID;
  const k = input.trim().toLowerCase();
  return VOICE_MAP[k] || input;
}

export function GET() {
  return new Response('Text-to-Speech OK', { status: 200 });
}

export async function POST(req: NextRequest) {
  // 1) Env
  let apiKey = (process.env.ELEVENLABS_API_KEY || '').trim().replace(/^"(.*)"$/, '$1');
  if (!apiKey) {
    console.error('❌ ELEVENLABS_API_KEY missing.');
    return NextResponse.json({ error: 'MISSING_API_KEY' }, { status: 500 });
  }

  // 2) Parse body early (we also use it for dev override)
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'BAD_JSON' }, { status: 400 });
  }
  const text = String(body?.text ?? '').trim();
  if (!text) return NextResponse.json({ error: 'MISSING_TEXT' }, { status: 400 });
  const requested = (body?.voiceId as string) || (body?.voice as string);

  // 3) Auth
  let userId: string | null = null;
  try {
    const a = await auth();
    userId = a?.userId ?? null;
  } catch (e) {
    // If middleware isn’t running, auth() may fail in production
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ auth() failed in production:', (e as any)?.message || e);
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
  }

  // 4) Determine Pro
  let isPro = false;

  // Dev-safe override so you can test locally
  const devForce = process.env.NODE_ENV !== 'production' && body?.__forcePro === true;

  if (devForce) {
    isPro = true;
  } else if (userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const pub = (user.publicMetadata as any) ?? {};
      const unsafe = (user.unsafeMetadata as any) ?? {};
      const priv = (user.privateMetadata as any) ?? {};
      isPro = pub.isPro === true || unsafe.isPro === true || priv.isPro === true;
    } catch (e) {
      isPro = false;
    }
  }

  // 5) Enforce Pro for ElevenLabs
  const chosenVoiceId = isPro ? resolveVoiceId(requested) : DEFAULT_VOICE_ID;
  if (!isPro && requested && requested !== DEFAULT_VOICE_ID) {
    // Free user trying to pick a custom voice
    const res = NextResponse.json({ error: 'NOT_PRO' }, { status: 403 });
    res.headers.set('x-pro', String(isPro));
    res.headers.set('x-voice-requested', requested || '');
    res.headers.set('x-voice-used', DEFAULT_VOICE_ID);
    res.headers.set('x-model', MODEL_ID);
    return res;
  }

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
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify(payload),
    });
  }

  try {
    let r = await callTTS(chosenVoiceId);

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      const retriable = (r.status === 404 || r.status === 429) && chosenVoiceId !== DEFAULT_VOICE_ID;

      if (retriable) {
        const fb = await callTTS(DEFAULT_VOICE_ID);
        if (!fb.ok) {
          const d2 = await fb.text().catch(() => '');
          const res = NextResponse.json(
            {
              error: 'PROVIDER_ERROR',
              providerStatus: fb.status,
              providerStatusText: fb.statusText,
              detail: d2.slice(0, 400),
            },
            { status: 502 }
          );
          res.headers.set('x-pro', String(isPro));
          res.headers.set('x-voice-requested', requested || '');
          res.headers.set('x-voice-used', DEFAULT_VOICE_ID);
          res.headers.set('x-model', MODEL_ID);
          return res;
        }
        const res = new Response(fb.body, {
          status: 200,
          headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
        });
        (res as any).headers?.set?.('x-pro', String(isPro));
        (res as any).headers?.set?.('x-voice-requested', requested || '');
        (res as any).headers?.set?.('x-voice-used', DEFAULT_VOICE_ID);
        (res as any).headers?.set?.('x-model', MODEL_ID);
        return res;
      }

      const res = NextResponse.json(
        {
          error: 'PROVIDER_ERROR',
          providerStatus: r.status,
          providerStatusText: r.statusText,
          detail: detail.slice(0, 400),
        },
        { status: 502 }
      );
      res.headers.set('x-pro', String(isPro));
      res.headers.set('x-voice-requested', requested || '');
      res.headers.set('x-voice-used', chosenVoiceId);
      res.headers.set('x-model', MODEL_ID);
      return res;
    }

    const res = new Response(r.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
    (res as any).headers?.set?.('x-pro', String(isPro));
    (res as any).headers?.set?.('x-voice-requested', requested || '');
    (res as any).headers?.set?.('x-voice-used', chosenVoiceId);
    (res as any).headers?.set?.('x-model', MODEL_ID);
    return res;
  } catch (e: any) {
    console.error('❌ TTS route failure:', e?.message || e);
    return NextResponse.json({ error: 'INTERNAL' }, { status: 500 });
  }
}
