import 'server-only';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_TEXT_LENGTH = 10_000;
const DEFAULT_VOICE = 'EXAVITQu4vr4xnSDxMaL';

const ALLOWED_VOICE_IDS = new Set([
  'ZT9u07TYPVl83ejeLakq',
  'jkSXBeN4g5pNelNQ3YWw',
  'EXAVITQu4vr4xnSDxMaL',
  'wUwsnXivqGrDWuz1Fc89',
  'NFG5qt843uXKj4pFvR7C',
  'BL7YSL1bAkmW8U0JnU8o',
  'tMyQcCxfGDdIt7wJ2RQw', // Marie Alice (French)
  'dFA3XRddYScy6ylAYTIO', // Helmut (German)
  'm7yTemJqdIqrcNleANfX', // Anna Maria (Spanish)
]);

interface ElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

interface WordTiming {
  word: string;
  startMs: number;
  endMs: number;
  wordIndex: number;
}

function extractWordTimings(text: string, alignment: ElevenLabsAlignment): WordTiming[] {
  const { characters, character_start_times_seconds, character_end_times_seconds } = alignment;
  const timings: WordTiming[] = [];
  let wordIndex = 0;
  let i = 0;

  while (i < text.length) {
    if (/[\s\-]/.test(text[i])) { i++; continue; }
    let j = i;
    while (j < text.length && !/\s/.test(text[j])) j++;
    if (i < characters.length) {
      const startMs = (character_start_times_seconds[i] ?? 0) * 1000;
      const endIdx = Math.min(j - 1, character_end_times_seconds.length - 1);
      const endMs = (character_end_times_seconds[endIdx] ?? character_start_times_seconds[i] ?? 0) * 1000;
      timings.push({
        word: text.slice(i, j),
        startMs: Math.round(startMs),
        endMs: Math.round(endMs),
        wordIndex: wordIndex++,
      });
    }
    i = j;
  }
  return timings;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const text = String(body?.text || '').trim();
  const voiceId = ALLOWED_VOICE_IDS.has(body?.voiceId) ? body.voiceId : DEFAULT_VOICE;

  if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  if (text.length > MAX_TEXT_LENGTH) return NextResponse.json({ error: 'Text too long' }, { status: 400 });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'TTS not configured' }, { status: 500 });

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err || 'TTS failed' }, { status: response.status });
    }

    const data = await response.json();
    const audioBase64: string = data.audio_base64;
    const alignment: ElevenLabsAlignment = data.alignment;

    if (!audioBase64 || !alignment) {
      return NextResponse.json({ error: 'Unexpected TTS response' }, { status: 500 });
    }

    return NextResponse.json({
      audioBase64,
      wordTimings: extractWordTimings(text, alignment),
    });
  } catch (e) {
    console.error('reading-speak error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
