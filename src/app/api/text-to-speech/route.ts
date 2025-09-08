// src/app/api/text-to-speech/route.ts
import { NextRequest } from 'next/server';
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';

const RACHEL_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel (stock)
const MODEL_ID = 'eleven_multilingual_v2';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  if (!process.env.ELEVENLABS_API_KEY) {
    return new Response('ELEVENLABS_API_KEY missing', { status: 500 });
  }

  // Parse JSON body
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const text = (body?.text ?? '').toString().trim();
  if (!text) return new Response('Text is required', { status: 400 });

  // ---- Determine Pro status
  let isPro = false;
  try {
    // If your project uses the "clerkClient" form elsewhere, use that:
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // const user = await clerkClient.users.getUser(userId);
    isPro =
      (user.publicMetadata as any)?.isPro === true ||
      (user.unsafeMetadata as any)?.isPro === true;
  } catch {
    // If Clerk lookup fails, treat as non-Pro to be safe
    isPro = false;
  }

  // ---- Choose voice
  // Pro: allow requested voice (or env default or Rachel)
  // Free: force Rachel
  const requestedVoice =
    (body?.voiceId as string) ||
    process.env.ELEVENLABS_VOICE_ID ||
    RACHEL_VOICE_ID;

  const chosenVoiceId = isPro ? requestedVoice : RACHEL_VOICE_ID;

  const attemptTTS = async (voiceId: string) => {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
      voiceId
    )}`;
    const payload = {
      text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.8,
        style: 0.0,
        use_speaker_boost: true,
      },
    };

    return fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify(payload),
    });
  };

  // 1) Try with chosen voice
  let elRes = await attemptTTS(chosenVoiceId);

  // 2) If the request fails due to custom-voice limit, retry with Rachel
  if (!elRes.ok) {
    let errText = '';
    try {
      errText = await elRes.text();
    } catch {
      // ignore
    }

    if (!isPro && chosenVoiceId !== RACHEL_VOICE_ID) {
      // In theory free users are already on Rachel; this is a safeguard.
      elRes = await attemptTTS(RACHEL_VOICE_ID);
    } else if (errText.includes('"voice_limit_reached"')) {
      elRes = await attemptTTS(RACHEL_VOICE_ID);
    } else {
      return new Response(
        `TTS failed (${elRes.status}): ${errText || 'Unknown error'}`,
        { status: 500 }
      );
    }
  }

  if (!elRes.ok) {
    const errText = await elRes.text().catch(() => '');
    return new Response(
      `TTS failed (${elRes.status}): ${errText || 'Unknown error'}`,
      { status: 500 }
    );
  }

  const stream = elRes.body;
  if (!stream) return new Response('Empty audio stream', { status: 500 });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'attachment; filename="speech.mp3"',
      'Cache-Control': 'no-store',
    },
  });
}

export function GET() {
  return new Response('Text-to-Speech OK', { status: 200 });
}
