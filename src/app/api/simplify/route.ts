import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { clerkClient, auth } from "@clerk/nextjs/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory daily usage (demo only — resets on server restart)
const dailyUsage = new Map<string, { count: number; date: string }>();
const todayStr = () => new Date().toISOString().split('T')[0];

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse JSON body safely
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const text = (body?.text as string | undefined)?.trim();
  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  // If OPENAI_API_KEY is missing, fail at runtime (don’t crash build)
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI not configured' },
      { status: 501 } // Not Implemented
    );
  }

try {
  // ✅ Get Clerk user and Pro status (your Clerk version uses the async client)
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const isPro =
    user.publicMetadata?.isPro === true ||
    (user.unsafeMetadata as any)?.isPro === true;

  // Free quota: 5/day (non-Pro)
  let newCount = 0;
  if (!isPro) {
    const today = todayStr();
    const rec = dailyUsage.get(userId);
    const current = rec && rec.date === today ? rec.count : 0;

    if (current >= 5) {
      return NextResponse.json(
        {
          error:
            'Daily limit reached (5/5). Upgrade to Pro for unlimited simplifications.',
          usage: { count: current, limit: 5, isPro: false },
        },
        { status: 429 }
      );
    }

    newCount = current + 1;
    dailyUsage.set(userId, { count: newCount, date: today });
  }

  // Lazy import + init OpenAI (prevents build-time crash)
  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // swap to your preferred model
    messages: [
      {
        role: 'system',
        content:
          'You simplify text for people with dyslexia. Use short sentences, simple words, and clear structure while keeping the original meaning.',
      },
      { role: 'user', content: `Please simplify this text:\n\n${text}` },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  const simplifiedText = completion.choices?.[0]?.message?.content?.trim();
  if (!simplifiedText) {
    return NextResponse.json(
      { error: 'No simplified text generated' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    simplifiedText,
    usage: {
      count: isPro ? 0 : newCount,
      limit: isPro ? 'Unlimited' : 5,
      isPro,
    },
  });
} catch (error: any) {
    console.error('❌ Simplify API Error:', error?.message || error);
    return NextResponse.json(
      { error: `Simplification failed: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ message: 'Simplify API is working' });
}

