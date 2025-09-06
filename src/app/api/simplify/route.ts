// src/app/api/simplify/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuth, clerkClient } from "@clerk/nextjs/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory daily usage (demo only — resets on server restart)
const dailyUsage = new Map<string, { count: number; date: string }>();
const todayStr = () => new Date().toISOString().split("T")[0];

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Missing OPENAI_API_KEY");
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  // Parse JSON body safely
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = body?.text as string | undefined;
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  try {
    console.log("🤖 Simplify API for user:", userId);
    console.log(
      "📝 Text preview:",
      text.slice(0, 80) + (text.length > 80 ? "…" : "")
    );

    // ✅ Correct Clerk usage (call clerkClient function first)
    const clerkUser = await (await clerkClient()).users.getUser(userId);

    const isPro =
      clerkUser?.publicMetadata?.isPro === true ||
      (clerkUser?.unsafeMetadata as any)?.isPro === true;

    console.log("🔎 Clerk user isPro check:", {
  fromPublic: clerkUser?.publicMetadata?.isPro,
  fromUnsafe: (clerkUser?.unsafeMetadata as any)?.isPro,
});


    // Free quota: 5/day (only for non-Pro)
    let newCount = 0;
    if (!isPro) {
      const today = todayStr();
      const rec = dailyUsage.get(userId);
      const current = rec && rec.date === today ? rec.count : 0;

      if (current >= 5) {
        return NextResponse.json(
          {
            error:
              "Daily limit reached (5/5). Upgrade to Pro for unlimited simplifications.",
            usage: { count: current, limit: 5, isPro: false },
          },
          { status: 429 }
        );
      }

      newCount = current + 1;
      dailyUsage.set(userId, { count: newCount, date: today });
      console.log("📊 Usage incremented to:", newCount);
    }

    console.log("🤖 Calling OpenAI…");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You simplify text for people with dyslexia. Use short sentences, simple words, and clear structure while keeping the original meaning.",
        },
        { role: "user", content: `Please simplify this text:\n\n${text}` },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const simplifiedText = completion.choices[0]?.message?.content?.trim();
    if (!simplifiedText) {
      return NextResponse.json(
        { error: "No simplified text generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      simplifiedText,
      usage: {
        count: isPro ? 0 : newCount,
        limit: isPro ? "Unlimited" : 5,
        isPro,
      },
    });
  } catch (error: any) {
    console.error("❌ Simplify API Error:", error?.message || error);
    return NextResponse.json(
      { error: `Simplification failed: ${error?.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ message: "Simplify API is working" });
}

