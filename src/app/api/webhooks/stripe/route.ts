// app/api/webhooks/stripe/route.ts
export const runtime = "nodejs";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (e: any) {
    console.error("❌ Stripe sig verify failed:", e.message);
    return new Response(`Webhook Error: ${e.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const uid = s.metadata?.userId || s.client_reference_id;
    console.log("🔎 webhook session uid:", uid, "metadata:", s.metadata);

    if (uid) {
      const clerk = await clerkClient();
      await clerk.users.updateUser(uid, {
        publicMetadata: { isPro: true, proSince: new Date().toISOString() },
      });
      console.log(`✅ Upgraded Clerk user ${uid} to Pro`);
    } else {
      console.warn("⚠️ No userId in session; skipped Clerk update");
    }
  }
  return new Response("ok", { status: 200 });
}



