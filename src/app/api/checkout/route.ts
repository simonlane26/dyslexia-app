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

function getPriceId(plan: PlanKey) {
  const envKey = PLAN_TO_PRICE_ENV[plan];
  const priceId = process.env[envKey];
  if (!priceId) throw new Error(`Missing env var: ${envKey}`);
  return priceId;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const plan: PlanKey = body?.plan;

    if (!plan || !(plan in PLAN_TO_PRICE_ENV)) {
      return NextResponse.json(
        { error: "Invalid plan. Provide one of: pro_test, pro_monthly, pro_annual, school_starter, school_mid, school_full" },
        { status: 400 }
      );
    }

    const priceId = getPriceId(plan);
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`;

        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          allow_promotion_codes: true,
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            userId: userId,
          },
        });
    
        return NextResponse.json({ url: session.url });
      } catch (error) {
        console.error("Error creating checkout session:", error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }
    }
