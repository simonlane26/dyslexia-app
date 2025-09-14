import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

type PlanKey =
  | "pro_monthly"
  | "pro_annual"
  | "school_starter"
  | "school_mid"
  | "school_full";

const PLAN_TO_PRICE_ENV: Record<PlanKey, string> = {
  pro_monthly: "STRIPE_PRO_PRICE_ID",
  pro_annual: "STRIPE_PRO_PRICE_ANNUAL_ID",
  school_starter: "STRIPE_SCHOOL_STARTER_PRICE_ID",
  school_mid: "STRIPE_SCHOOL_MID_PRICE_ID",
  school_full: "STRIPE_SCHOOL_FULL_PRICE_ID",
};

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const APP_URL = requireEnv("NEXT_PUBLIC_APP_URL");

    const body = await req.json().catch(() => ({}));
    const plan = body?.plan as PlanKey | undefined;
    if (!plan || !(plan in PLAN_TO_PRICE_ENV)) {
      return NextResponse.json(
        { error: "Invalid plan. Use: pro_monthly, pro_annual, school_starter, school_mid, school_full" },
        { status: 400 }
      );
    }

    const priceId = requireEnv(PLAN_TO_PRICE_ENV[plan]);
    const price = await stripe.prices.retrieve(priceId);

    const isRecurring = !!price.recurring;
    const mode: "subscription" | "payment" = isRecurring ? "subscription" : "payment";

    // Optional trial via envs
    const trialEnabled = (process.env.TRIAL_ENABLED ?? "false").toLowerCase() === "true";
    const trialDays = Number(process.env.TRIAL_DAYS ?? "0");
    const wantsTrial = isRecurring && trialEnabled && trialDays > 0 && plan === "pro_monthly";

    const params: Stripe.Checkout.SessionCreateParams = {
      mode,
      payment_method_types: ["card"],
      payment_method_collection: "always", // ensure a PM on file (esp. with trials)
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      billing_address_collection: "auto",   // better VAT accuracy
      tax_id_collection: { enabled: true }, // let orgs enter VAT number
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pricing`,
      client_reference_id: userId,
      metadata: { userId, plan, mode, trial: wantsTrial ? "true" : "false" },
    };

    if (isRecurring) {
      params.subscription_data = {
        metadata: { userId, plan },
        ...(wantsTrial ? { trial_period_days: trialDays } : {}),
      } as any;
    } else {
      params.payment_intent_data = { metadata: { userId, plan } };
    }

    const session = await stripe.checkout.sessions.create(params);
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Error creating checkout session:", err);
    const msg = process.env.NODE_ENV === "development" ? err?.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}



