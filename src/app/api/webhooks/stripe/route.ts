// app/api/webhooks/stripe/route.ts
export const runtime = "nodejs";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { getOrigin } from "@/lib/origin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

   if (!sig) {
    console.error("❌ Missing Stripe signature header");
    return new Response("Missing signature", { status: 400 });
  }

   // IMPORTANT: Stripe needs the **raw** request body for signature verification
  const rawBody = Buffer.from(await req.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err?.message);
    return new Response(`Webhook Error: ${err?.message}`, { status: 400 });
  }

  const origin = getOrigin();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // We passed Clerk userId in metadata during checkout creation
        const clerkUserId =
          (session.metadata as any)?.userId ||
          (session.client_reference_id as string | undefined);

        console.log("✅ checkout.session.completed", {
          origin,
          sessionId: session.id,
          clerkUserId,
          customer: session.customer,
        });

        if (clerkUserId) {
          const clerk = await clerkClient();
          await clerk.users.updateUser(clerkUserId, {
            publicMetadata: { isPro: true },
          });
        } else {
          console.warn("⚠️ No clerkUserId found in session metadata/client_reference_id");
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // Try to recover the userId from various places
        const clerkUserId =
          (invoice.metadata as any)?.userId ??
          (invoice.lines?.data?.[0]?.metadata as any)?.userId;

        console.log("⚠️ invoice.payment_failed", {
          origin,
          invoiceId: invoice.id,
          clerkUserId,
        });
        if (clerkUserId) {
          const clerk = await clerkClient();
          await clerk.users.updateUser(clerkUserId, {
            publicMetadata: { isPro: false },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId =
          (sub.metadata as any)?.userId ??
          (sub.items?.data?.[0]?.price?.metadata as any)?.userId;

        console.log("⚠️ customer.subscription.deleted", {
          origin,
          subscriptionId: sub.id,
          clerkUserId,
        });

        if (clerkUserId) {
          const clerk = await clerkClient();
          await clerk.users.updateUser(clerkUserId, {
            publicMetadata: { isPro: false },
          });
        }
        break;
      }

      default: {
        // Optional: log other events during testing
        // console.log(`➡️ Unhandled event type: ${event.type}`);
      }
    }

    return new Response("ok", { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook handler error:", err?.message || err);
    return new Response("Server error", { status: 500 });
  }
}