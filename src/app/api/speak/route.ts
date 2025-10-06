// src/app/api/speak/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, voiceId = 'EXAVITQu4vr4xnSDxMaL', stability = 0.5, similarity = 0.75 } = await req.json();
    if (!text || !text.trim()) return NextResponse.json({ error: 'No text' }, { status: 400 });

    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        // You can add model_id if you have access to specific voice models
        // model_id: "eleven_multilingual_v2",
        voice_settings: { stability, similarity_boost: similarity },
        // If your plan supports timestamps/alignment, enable it here (name differs by plan/model).
        // enable_tts_markers: true,
        // return_timestamps: true,
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
