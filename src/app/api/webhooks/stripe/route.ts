// src/app/api/webhooks/stripe/route.ts
import "server-only";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

function getUserIdFromLines(inv: Stripe.Invoice): string | undefined {
  for (const line of inv.lines?.data ?? []) {
    const fromLine =
      (line.metadata as any)?.userId ||
      ((line as any).price?.metadata as any)?.userId ||
      (((line as any).price?.product as any)?.metadata?.userId); // if product is expanded
    if (fromLine) return String(fromLine);
  }
  return undefined;
}

/** Tries multiple places to find the Clerk userId for an invoice */
async function getUserIdFromInvoice(inv: Stripe.Invoice): Promise<string | undefined> {
  // Best: you set this at checkout/sub creation
  if (inv.metadata?.userId) return inv.metadata.userId;

  // Often present on newer payloads (not typed in SDK, so cast)
  const subMeta =
    (inv as any).subscription_details?.metadata?.userId as string | undefined;
  if (subMeta) return subMeta;

  // Fallback: scan ALL lines (because of Stripe's sort order)
  const fromLines = getUserIdFromLines(inv);
  if (fromLines) return fromLines;

  // Last resort: fetch the subscription and read its metadata
  if ((inv as any).subscription) {
    try {
      const sub = await stripe.subscriptions.retrieve((inv as any).subscription as string);
      const uid = (sub.metadata as any)?.userId as string | undefined;
      if (uid) return uid;
    } catch (e) {
      console.warn("⚠️ Failed to retrieve subscription for invoice:", inv.id);
    }
  }

  return undefined;
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
  if (!sig) return new Response("Bad Request", { status: 400 });

  // Raw body required for Stripe signature verification
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e: any) {
    console.error("❌ Stripe signature verify failed:", e?.message || e);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;

        // Prefer metadata.userId; fallback to client_reference_id
        const clerkUserId =
          (s.metadata as any)?.userId || (s.client_reference_id as string | undefined);

        if (!clerkUserId) {
          console.warn("⚠️ No clerkUserId on checkout.session.completed", s.id);
          break;
        }

        const client = await clerkClient();
        await client.users.updateUser(clerkUserId, {
          publicMetadata: {
            isPro: true,
            proSince: new Date().toISOString(),
            stripeCustomerId: s.customer as string | undefined,
          },
        });

        console.log("✅ Marked user Pro:", clerkUserId);
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const clerkUserId = await getUserIdFromInvoice(inv);

        if (!clerkUserId) {
          console.warn("⚠️ payment_failed without clerk userId", inv.id);
          break;
        }

        const client = await clerkClient();
        await client.users.updateUser(clerkUserId, {
          publicMetadata: { isPro: false },
        });

        console.log("⚠️ Payment failed → unset Pro:", clerkUserId);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        const clerkUserId =
          (sub.metadata as any)?.userId ??
          (sub.items?.data?.[0]?.price?.metadata as any)?.userId;

        if (!clerkUserId) {
          console.warn("⚠️ subscription.deleted without clerk userId", sub.id);
          break;
        }

        const client = await clerkClient();
        await client.users.updateUser(clerkUserId, {
          publicMetadata: { isPro: false },
        });

        console.log("⚠️ Subscription deleted → unset Pro:", clerkUserId);
        break;
      }

      default:
        // no-op for other events
        break;
    }

    return new Response("ok", { status: 200 });
  } catch (e: any) {
    console.error("❌ Webhook handler error:", e?.message || e);
    return new Response("Server error", { status: 500 });
  }
}
