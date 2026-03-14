import 'server-only';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function cleanEnv(v?: string | null) {
  return (v || '').trim().replace(/^"(.*)"$/, '$1');
}

const OPENAI_KEY = cleanEnv(process.env.OPENAI_API_KEY);
const OPENROUTER_KEY = cleanEnv(process.env.OPENROUTER_API_KEY);
const SITE_URL = cleanEnv(process.env.NEXT_PUBLIC_SITE_URL) || 'https://www.dyslexiawrite.com';

const BASE_PROMPT = `You are a friendly, patient writing helper inside DyslexiaWrite. You are talking directly with the person who is writing.

YOUR ROLE:
- You guide the writer step by step — you never write FOR them
- You help them find their OWN words and ideas
- You ask ONE simple question at a time
- You keep every reply to 1–3 sentences maximum
- You use plain, everyday language — no grammar jargon ever
- You are always encouraging. Never critical. Never negative.

HOW TO HELP:
- If they're stuck: offer two options ("Would you rather write about X or Y?")
- If they've written something: notice something good first, then ask a follow-up question
- If a sentence is very long: gently ask if they'd like help splitting it
- If asked to tidy spelling/grammar: do it while keeping their exact words and voice
- If they ask "does this make sense?": summarise what you understood from their text, then ask if that's what they meant

ALWAYS remember: your job is to be a quiet, confident helper in the background. One question. Short. Warm. That's it.`;

function buildAssignmentPrompt(
  title: string,
  subType: string,
  currentSection: string,
  sectionIndex: number,
  totalSections: number,
): string {
  const sectionGuidance: Record<string, Record<string, string>> = {
    essay: {
      'Introduction': 'Help the writer say what their essay is about and what their main point will be. Keep it to 2–3 sentences.',
      'Main Points':  'Help the writer explain their key ideas with examples. Ask one point at a time.',
      'Conclusion':   'Help the writer wrap up by restating their main point in different words. Ask what they want the reader to remember.',
    },
    story: {
      'Beginning': 'Help the writer set the scene and introduce the main character. Ask who, where, and when.',
      'Middle':    'Help the writer describe what happens — the problem or challenge. Ask what goes wrong or what the character wants.',
      'End':       'Help the writer resolve the story. Ask how the problem is solved and how the character feels.',
    },
    report: {
      'Introduction': 'Help the writer explain what the report is about and why it matters.',
      'Findings':     'Help the writer share the key facts or discoveries, one at a time.',
      'Summary':      'Help the writer sum up the most important points and any recommendations.',
    },
    letter: {
      'Opening':      'Help the writer start politely and explain why they are writing.',
      'Main Message': 'Help the writer clearly say what they need or want the reader to know.',
      'Sign-off':     'Help the writer close the letter warmly and professionally.',
    },
    homework: {
      'The Question': 'Help the writer understand what the question is asking in their own words before they start.',
      'Your Answer':  'Help the writer write their answer step by step, one idea at a time.',
      'Checking It':  'Help the writer read back their answer and check it makes sense. Ask: does this answer the question?',
    },
  };

  const typeMap = sectionGuidance[subType] ?? sectionGuidance.essay;
  const guidance = typeMap[currentSection] ?? `Help the writer work on the ${currentSection} section.`;
  const isLast = sectionIndex === totalSections - 1;

  return `The writer is working on a structured ASSIGNMENT.
Title: "${title}"
Type: ${subType}
Current section: ${currentSection} (section ${sectionIndex + 1} of ${totalSections})
${isLast ? 'This is the FINAL section.' : 'After this section they will move on to the next.'}

SECTION FOCUS: ${guidance}

RULES:
- Stay focused on THIS section only — do not jump ahead
- Ask ONE question at a time about this section
- Keep every reply to 1–3 short sentences
- Be encouraging — celebrate what they've already written`;
}

const WRITING_TYPE_GUIDANCE: Record<string, string> = {
  email: `The writer is writing an EMAIL.
First question to ask: "Who are you writing to?"
Then ask: "What do you want them to do or know after reading it?"
Keep suggestions friendly and direct. Short paragraphs. Clear ask.`,

  essay: `The writer is writing an ESSAY.
First question to ask: "What is the main topic?"
Then ask: "What's the main point you want to make?"
Help them structure: intro idea → main point → example → conclusion.`,

  'work message': `The writer is writing a WORK MESSAGE (e.g. Slack, Teams, email to a colleague or manager).
First question to ask: "Who is this going to?"
Then ask: "What's the key thing you need to say or ask?"
Keep it professional but human. Short and clear.`,

  'social post': `The writer is writing a SOCIAL POST.
First question to ask: "Which platform is this for — Instagram, X, LinkedIn, something else?"
Then ask: "What do you want people to feel or do after reading it?"
Keep it punchy. One idea per post.`,

  story: `The writer is writing a STORY.
First question to ask: "Who is the main character?"
Then ask: "What happens to them?"
Help them paint a picture with simple, vivid details. One scene at a time.`,

  notes: `The writer is taking NOTES.
First question to ask: "What are you taking notes about?"
Then ask: "What's the most important thing you want to remember?"
Help them spot the key ideas and put them in their own words.`,

  homework: `The writer is doing HOMEWORK.
First question to ask: "What subject is this for?"
Then ask: "What does the assignment ask you to do?"
Be encouraging. Break it into small steps. Never do the work for them.`,
};

function buildSystemPrompt(
  writingType?: string,
  assignmentOpts?: {
    title: string;
    subType: string;
    currentSection: string;
    sectionIndex: number;
    totalSections: number;
  },
): string {
  if (writingType === 'assignment' && assignmentOpts) {
    const assignmentGuidance = buildAssignmentPrompt(
      assignmentOpts.title,
      assignmentOpts.subType,
      assignmentOpts.currentSection,
      assignmentOpts.sectionIndex,
      assignmentOpts.totalSections,
    );
    return `${BASE_PROMPT}\n\n--- ASSIGNMENT CONTEXT ---\n${assignmentGuidance}`;
  }
  const typeKey = (writingType || '').toLowerCase().trim();
  const typeGuidance = WRITING_TYPE_GUIDANCE[typeKey];
  if (typeGuidance) {
    return `${BASE_PROMPT}\n\n--- WRITING TYPE CONTEXT ---\n${typeGuidance}`;
  }
  return BASE_PROMPT;
}

function buildMessages(
  documentText: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[],
  writingType?: string,
  assignmentOpts?: {
    title: string;
    subType: string;
    currentSection: string;
    sectionIndex: number;
    totalSections: number;
  },
) {
  const docContext = documentText.trim()
    ? `The writer's document so far:\n"""\n${documentText.slice(0, 3000)}\n"""`
    : 'The writer has not started yet. The document is empty.';

  return [
    { role: 'system' as const, content: buildSystemPrompt(writingType, assignmentOpts) },
    { role: 'system' as const, content: docContext },
    ...chatHistory,
  ];
}

export async function POST(req: NextRequest) {
  // 1) Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'NOT_SIGNED_IN' }, { status: 401 });
  }

  // 2) Pro check
  const user = await currentUser();
  const isPro =
    (user?.publicMetadata as any)?.isPro === true ||
    (user?.unsafeMetadata as any)?.isPro === true;
  if (!isPro) {
    return NextResponse.json({ error: 'PRO_REQUIRED' }, { status: 403 });
  }

  // 3) Parse body
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'BAD_JSON' }, { status: 400 });
  }

  const documentText = String(body?.documentText ?? '').slice(0, 10_000);
  const chatHistory: { role: 'user' | 'assistant'; content: string }[] =
    Array.isArray(body?.chatHistory) ? body.chatHistory.slice(-20) : [];
  const writingType = typeof body?.writingType === 'string' ? body.writingType : undefined;
  const assignmentOpts = writingType === 'assignment' && body?.assignmentTitle
    ? {
        title: String(body.assignmentTitle).slice(0, 200),
        subType: String(body.assignmentSubType || 'essay'),
        currentSection: String(body.currentSection || ''),
        sectionIndex: Number(body.sectionIndex ?? 0),
        totalSections: Number(body.totalSections ?? 3),
      }
    : undefined;

  // 4) Pick provider
  const useOpenAI = OPENAI_KEY && OPENAI_KEY.length > 20;
  const useOpenRouter = OPENROUTER_KEY && OPENROUTER_KEY.length > 20;

  if (!useOpenAI && !useOpenRouter) {
    return NextResponse.json({ error: 'NO_PROVIDER' }, { status: 500 });
  }

  const url = useOpenAI
    ? 'https://api.openai.com/v1/chat/completions'
    : 'https://openrouter.ai/api/v1/chat/completions';
  const model = useOpenAI ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';
  const apiKey = useOpenAI ? OPENAI_KEY : OPENROUTER_KEY;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  if (!useOpenAI) {
    headers['HTTP-Referer'] = SITE_URL;
    headers['X-Title'] = 'DyslexiaWrite Assistant';
  }

  // 5) Call AI
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 25_000);

  try {
    const messages = buildMessages(documentText, chatHistory, writingType, assignmentOpts);
    const upstream = await fetch(url, {
      method: 'POST',
      headers,
      signal: ctrl.signal,
      body: JSON.stringify({ model, temperature: 0.7, max_tokens: 200, messages }),
    });
    clearTimeout(timeout);

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return NextResponse.json({ error: 'PROVIDER_ERROR', detail }, { status: 502 });
    }

    const data = await upstream.json();
    const message = data?.choices?.[0]?.message?.content?.trim() ?? '';

    if (!message) {
      return NextResponse.json({ error: 'EMPTY_RESPONSE' }, { status: 502 });
    }

    return NextResponse.json({ message }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    clearTimeout(timeout);
    return NextResponse.json({ error: 'INTERNAL', detail: e?.message }, { status: 500 });
  }
}
