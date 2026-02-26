// src/app/api/speak/route.ts
export const runtime = 'nodejs';

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const MAX_TEXT_LENGTH = 1000;

const ALLOWED_VOICE_IDS = new Set([
  'ZT9u07TYPVl83ejeLakq',
  'jkSXBeN4g5pNelNQ3YWw',
  'EXAVITQu4vr4xnSDxMaL',
  'wUwsnXivqGrDWuz1Fc89',
  'NFG5qt843uXKj4pFvR7C',
  'BL7YSL1bAkmW8U0JnU8o',
]);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { text, voiceId = 'EXAVITQu4vr4xnSDxMaL', stability = 0.5, similarity = 0.75 } = await req.json();
    if (!text || !text.trim()) return NextResponse.json({ error: 'No text' }, { status: 400 });
    if (text.length > MAX_TEXT_LENGTH) return NextResponse.json({ error: 'Text too long' }, { status: 400 });
    const safeVoiceId = ALLOWED_VOICE_IDS.has(voiceId) ? voiceId : 'EXAVITQu4vr4xnSDxMaL';

    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${safeVoiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice_settings: { stability, similarity_boost: similarity },
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return NextResponse.json({ error: errText || 'TTS failed' }, { status: r.status });
    }

    const audio = await r.arrayBuffer();
    return new NextResponse(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
