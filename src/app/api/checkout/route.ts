// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

type PlanKey =
  | "pro_test"
  | "pro_monthly"
  | "pro_annual"
  | "school_starter"
  | "school_mid"
  | "school_full";

const PLAN_TO_PRICE_ENV: Record<PlanKey, string> = {
  pro_test: "STRIPE_PRO_TEST_PRICE_ID",
  pro_monthly: "STRIPE_PRO_PRICE_ID",
  pro_annual: "STRIPE_PRO_PRICE_ANNUAL_ID",
  school_starter: "STRIPE_SCHOOL_STARTER_PRICE_ID",
  school_mid: "STRIPE_SCHOOL_MID_PRICE_ID",
  school_full: "STRIPE_SCHOOL_FULL_PRICE_ID",
};

function getPriceIdOrNull(plan: PlanKey) {
  const envKey = PLAN_TO_PRICE_ENV[plan];
  const priceId = process.env[envKey];
  return priceId ? { envKey, priceId } : { envKey, priceId: null as string | null };
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const plan = body?.plan as PlanKey | undefined;

    if (!plan || !(plan in PLAN_TO_PRICE_ENV)) {
      return NextResponse.json(
        { error: "Invalid plan. Use one of: pro_test, pro_monthly, pro_annual, school_starter, school_mid, school_full" },
        { status: 400 }
      );
    }

    const { envKey, priceId } = getPriceIdOrNull(plan);
    if (!priceId) {
      return NextResponse.json(
        { error: `Plan temporarily unavailable (missing ${envKey} in server config)` },
        { status: 400 }
      );
    }

    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Error creating checkout session:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

