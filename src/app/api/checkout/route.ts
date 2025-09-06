// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_MAP: Record<string, string | undefined> = {
  PRO_MONTHLY: process.env.STRIPE_PRO_PRICE_ID,        // matches STRIPE_PRO_PRICE_ID
  PRO_ANNUAL: process.env.STRIPE_PRO_PRICE_ANNUAL_ID,     // matches STRIPE_PRO_PRICE_ANNUAL
  SCHOOL_STARTER: process.env.STRIPE_SCHOOL_STARTER_PRICE_ID,
  SCHOOL_MID: process.env.STRIPE_SCHOOL_MID_PRICE_ID,
  SCHOOL_FULL: process.env.STRIPE_SCHOOL_FULL_PRICE_ID,
};

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    console.error("❌ Unauthorized: no Clerk user");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    console.warn("⚠️ Non-JSON request; defaulting to single-plan");
  }

  const body = await req.json().catch(() => ({} as any));
  const planKey = (body?.plan as string | undefined)?.toUpperCase();

  const priceId = planKey ? PRICE_MAP[planKey] : process.env.STRIPE_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Debug logs
  console.log("🧪 userId:", userId);
  console.log("🧪 planKey:", planKey);
  console.log("🧪 priceId:", priceId);
  console.log("🧪 NEXT_PUBLIC_APP_URL:", appUrl);

  if (!priceId) {
    return NextResponse.json(
      { error: "Missing Stripe Price ID (set STRIPE_PRICE_ID or STRIPE_PRICE_* for the plan)" },
      { status: 500 }
    );
  }

  if (!appUrl || !/^https?:\/\//i.test(appUrl)) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_APP_URL must start with http:// or https://" },
      { status: 500 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel`,
      metadata: { userId: String(userId) },
      client_reference_id: String(userId),
      subscription_data: { metadata: { userId: String(userId) } },
    });

    console.log("✅ Created checkout session:", session.id);
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    // Show Stripe’s details clearly
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
