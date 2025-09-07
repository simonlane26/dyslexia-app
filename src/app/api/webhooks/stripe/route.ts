// src/app/api/webhooks/stripe/route.ts
import "server-only";
import { NextRequest } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ use cast to bypass the bogus pre-release version type
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

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

/** Minimal Clerk REST helper (no SDK imports at all) */
async function clerkPatchUserPublicMetadata(
  userId: string,
  publicMetadata: Record<string, unknown>
) {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) throw new Error("Missing CLERK_SECRET_KEY");

  const res = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ public_metadata: publicMetadata }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Clerk PATCH failed: ${res.status} ${res.statusText} ${text}`);
  }
}

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
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const uid =
          (s.metadata as any)?.userId || (s.client_reference_id as string | undefined);
        if (uid) {
          await clerkPatchUserPublicMetadata(uid, {
            isPro: true,
            proSince: new Date().toISOString(),
            stripeCustomerId: s.customer as string | undefined,
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const uid = await getUserIdFromInvoice(inv);
        if (uid) {
          await clerkPatchUserPublicMetadata(uid, { isPro: false });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const uid =
          (sub.metadata as any)?.userId ??
          (sub.items?.data?.[0]?.price?.metadata as any)?.userId;
        if (uid) {
          await clerkPatchUserPublicMetadata(uid, { isPro: false });
        }
        break;
      }

      default:
        break;
    }

    return new Response("ok", { status: 200 });
  } catch (e: any) {
    console.error("❌ Webhook handler error:", e?.message || e);
    return new Response("Server error", { status: 500 });
  }
}
