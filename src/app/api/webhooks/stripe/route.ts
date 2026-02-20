// src/app/api/webhooks/stripe/route.ts
import "server-only";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

/* ---------- helpers ---------- */

function generateSchoolCode(): string {
  // Avoids visually confusable characters (0/O, 1/I/l)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const SCHOOL_MAX_STUDENTS: Record<string, number> = {
  starter: 30,
  mid: 150,
  full: 500,
};

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
    } catch {}
  }
  return undefined;
}

async function clerkPatchUserMetadata(
  userId: string,
  { privateData, publicData }: { privateData?: Record<string, unknown>; publicData?: Record<string, unknown> }
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

/* ---------- route ---------- */

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

    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const uid = (s.metadata as any)?.userId || (s.client_reference_id as string | undefined);
      if (!uid) {
        console.warn("[stripe] checkout.session.completed without userId");
        return new Response("ok", { status: 200 });
      }

      const plan = (s.metadata as any)?.plan as string | undefined;
      const mode = (s.metadata as any)?.mode as string | undefined;

      const flags: Record<string, unknown> = {
        isPro: true,
        proSince: new Date().toISOString(),
        stripeCustomerId: (s.customer as string) || undefined,
      };

      let publicExtra: Record<string, unknown> = {};

      if (plan?.startsWith("school_")) {
        const tier = plan.replace("school_", "") as "starter" | "mid" | "full";
        flags.schoolTier = tier;

        // Create a school record in Supabase and store the school code
        try {
          const db = createSupabaseServerClient();
          const schoolCode = generateSchoolCode();
          const { data: school, error } = await db
            .from("schools")
            .insert({
              name: "My School",
              school_code: schoolCode,
              plan_tier: tier,
              stripe_customer_id: (s.customer as string) || null,
              max_students: SCHOOL_MAX_STUDENTS[tier] ?? 30,
            })
            .select("id")
            .single();

          if (!error && school) {
            publicExtra = {
              schoolId: school.id,
              schoolRole: "teacher",
              schoolCode,
            };
            console.log("[stripe] ✅ created school", school.id, "code:", schoolCode);
          } else {
            console.error("[stripe] ⚠️ failed to create school record:", error?.message);
          }
        } catch (dbErr: any) {
          console.error("[stripe] ⚠️ supabase error:", dbErr?.message);
        }
      }

      await clerkPatchUserMetadata(uid, {
        privateData: flags,
        publicData: { isPro: true, plan: plan ?? null, mode: mode ?? null, ...publicExtra },
      });

      console.log("[stripe] ✅ set isPro=true for", uid, "plan:", plan, "mode:", mode);
    }

    // Keep Pro after renewals
    if (event.type === "invoice.payment_succeeded") {
      const inv = event.data.object as Stripe.Invoice;
      if (inv.subscription) {
        const uid = await getUserIdFromInvoice(inv);
        if (uid) {
          await clerkPatchUserMetadata(uid, {
            privateData: { isPro: true },
            publicData: { isPro: true },
          });
          console.log("[stripe] ✅ invoice.payment_succeeded -> isPro=true for", uid);
        }
      }
    }

    // Turn Pro off on failure / cancel
    if (event.type === "invoice.payment_failed") {
      const inv = event.data.object as Stripe.Invoice;
      const uid = await getUserIdFromInvoice(inv);
      if (uid) {
        await clerkPatchUserMetadata(uid, {
          privateData: { isPro: false },
          publicData: { isPro: false },
        });
        console.log("[stripe] ⚠️ invoice.payment_failed -> isPro=false for", uid);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const uid =
        (sub.metadata as any)?.userId ??
        (sub.items?.data?.[0]?.price?.metadata as any)?.userId;
      if (uid) {
        await clerkPatchUserMetadata(uid, {
          privateData: { isPro: false },
          publicData: { isPro: false },
        });
        console.log("[stripe] ⚠️ subscription.deleted -> isPro=false for", uid);
      }
    }

    return new Response("ok", { status: 200 });
  } catch (e: any) {
    console.error("❌ Webhook handler error:", e?.message || e);
    return new Response("Server error", { status: 500 });
  }
}


