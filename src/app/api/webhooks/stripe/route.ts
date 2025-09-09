// src/app/api/webhooks/stripe/route.ts
import "server-only";
import { NextRequest } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ Stripe SDK
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

/* ---------------------------------- Utils --------------------------------- */

function getUserIdFromLines(inv: Stripe.Invoice): string | undefined {
  for (const line of inv.lines?.data ?? []) {
    const fromLine =
      (line.metadata as any)?.userId ||
      (line as any).price?.metadata?.userId ||
      ((line as any).price?.product as any)?.metadata?.userId;
    if (fromLine) return String(fromLine);
  }
  return undefined;
}

async function getUserIdFromInvoice(inv: Stripe.Invoice): Promise<string | undefined> {
  if (inv.metadata?.userId) return inv.metadata.userId;

  const subMeta = (inv as any).subscription_details?.metadata?.userId as string | undefined;
  if (subMeta) return subMeta;

  const fromLines = getUserIdFromLines(inv);
  if (fromLines) return fromLines;

  if ((inv as any).subscription) {
    try {
      const sub = await stripe.subscriptions.retrieve((inv as any).subscription as string);
      const uid = (sub.metadata as any)?.userId as string | undefined;
      if (uid) return uid;
    } catch {
      // ignore
    }
  }
  return undefined;
}

/** Clerk REST helper: patch BOTH private & public metadata in one request */
async function clerkPatchUserMetadata(
  userId: string,
  {
    privateData,
    publicData,
  }: {
    privateData?: Record<string, unknown>;
    publicData?: Record<string, unknown>;
  }
) {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) throw new Error("Missing CLERK_SECRET_KEY");

  const body: any = {};
  if (privateData) body.private_metadata = privateData;
  if (publicData) body.public_metadata = publicData;

  const res = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Clerk PATCH failed: ${res.status} ${res.statusText} ${text}`);
  }
}

/* ---------------------------------- Route --------------------------------- */

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
  if (!sig) return new Response("Bad Request", { status: 400 });

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e: any) {
    console.error("❌ Stripe signature verify failed:", e?.message || e);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    console.log("[stripe] event:", event.type);

    switch (event.type) {
      // Fires for BOTH subscription and one-time checkout flows
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;

        const uid =
          (s.metadata as any)?.userId || (s.client_reference_id as string | undefined);
        if (!uid) {
          console.warn("[stripe] checkout.session.completed without userId");
          break;
        }

        const plan = (s.metadata as any)?.plan as string | undefined;
        const mode = (s.metadata as any)?.mode as string | undefined;

        const flags: Record<string, unknown> = {
          isPro: true,
          proSince: new Date().toISOString(),
          stripeCustomerId: (s.customer as string) || undefined,
        };

        if (plan?.startsWith("school_")) {
          flags.schoolTier = plan.replace("school_", ""); // starter|mid|full
        }

        // ✅ Write to private metadata (used by your app) and mirror minimal info to public for quick checks
        await clerkPatchUserMetadata(uid, {
          privateData: flags,
          publicData: { isPro: true, plan: plan || null, mode: mode || null },
        });

        console.log("[stripe] set isPro=true for user", uid, "plan:", plan, "mode:", mode);
        break;
      }

      // Keep Pro active after renewals or resume of subscription
      case "invoice.payment_succeeded": {
        const inv = event.data.object as Stripe.Invoice;

        // Only relevant for subscription invoices
        if (!inv.subscription) break;

        const uid = await getUserIdFromInvoice(inv);
        if (!uid) break;

        await clerkPatchUserMetadata(uid, {
          privateData: { isPro: true },
          publicData: { isPro: true },
        });

        console.log("[stripe] invoice.payment_succeeded -> isPro=true for", uid);
        break;
      }

      // Turn off Pro if payment fails or subscription is canceled
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const uid = await getUserIdFromInvoice(inv);
        if (!uid) break;

        await clerkPatchUserMetadata(uid, {
          privateData: { isPro: false },
          publicData: { isPro: false },
        });

        console.log("[stripe] invoice.payment_failed -> isPro=false for", uid);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const uid =
          (sub.metadata as any)?.userId ??
          (sub.items?.data?.[0]?.price?.metadata as any)?.userId;
        if (!uid) break;

        await clerkPatchUserMetadata(uid, {
          privateData: { isPro: false },
          publicData: { isPro: false },
        });

        console.log("[stripe] subscription.deleted -> isPro=false for", uid);
        break;
      }

      default:
        // no-op
        break;
    }

    return new Response("ok", { status: 200 });
  } catch (e: any) {
    console.error("❌ Webhook handler error:", e?.message || e);
    return new Response("Server error", { status: 500 });
  }
}

