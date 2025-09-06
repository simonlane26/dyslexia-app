// app/api/checkout/route.ts
import 'server-only';
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrigin } from "@/lib/origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_MAP: Record<string, string | undefined> = {
  PRO_MONTHLY: process.env.STRIPE_PRO_PRICE_ID,
  PRO_ANNUAL: process.env.STRIPE_PRO_PRICE_ANNUAL_ID,
  SCHOOL_STARTER: process.env.STRIPE_SCHOOL_STARTER_PRICE_ID,
  SCHOOL_MID: process.env.STRIPE_SCHOOL_MID_PRICE_ID,
  SCHOOL_FULL: process.env.STRIPE_SCHOOL_FULL_PRICE_ID,
};

export async function POST(req: NextRequest) {
  // ✅ Lazy import Clerk server helpers at runtime to avoid build-time init
  const { getAuth } = await import("@clerk/nextjs/server");
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  const planKey = (body?.plan as string | undefined)?.toUpperCase();
  const priceId = planKey ? PRICE_MAP[planKey] : process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json(
      { error: "Missing Stripe Price ID (set STRIPE_PRICE_ID or STRIPE_PRICE_* for the plan)" },
      { status: 500 }
    );
  }

  const origin = getOrigin();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      metadata: { userId: String(userId) },
      client_reference_id: String(userId),
      subscription_data: { metadata: { userId: String(userId) } },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Stripe checkout error:", {
      message: err?.message,
      code: err?.code,
      type: err?.type,
      param: err?.param,
      raw_message: err?.raw?.message,
    });
    return NextResponse.json(
      { error: err?.raw?.message ?? err?.message ?? "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
