// src/app/api/webhooks/stripe/route.ts
import 'server-only';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';

export const runtime = 'nodejs';        // ✅ Stripe needs Node runtime (not Edge)
export const dynamic = 'force-dynamic'; // ✅ no caching for webhooks

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil', // ✅ use a real, supported API version
});

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get('stripe-signature');

  if (!webhookSecret) {
    console.error('❌ Missing STRIPE_WEBHOOK_SECRET');
    return new Response('Webhook configuration error', { status: 500 });
  }
  if (!signature) {
    console.error('❌ Missing stripe-signature header');
    return new Response('Bad Request', { status: 400 });
  }

  // Stripe requires the raw body for signature verification
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err?.message || err);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Prefer metadata.userId (we set it at checkout); fall back to client_reference_id
        const clerkUserId =
          (session.metadata as Record<string, string> | null)?.userId ||
          (session.client_reference_id as string | undefined);

        if (!clerkUserId) {
          console.warn('⚠️ No Clerk userId on session; cannot mark Pro', {
            sessionId: session.id,
          });
          break;
        }

        const clerk = await clerkClient();
        await clerk.users.updateUser(clerkUserId, {
          publicMetadata: {
            isPro: true,
            proSince: new Date().toISOString(),
            stripeCustomerId: session.customer as string | undefined,
          },
        });

        console.log('✅ Marked user Pro:', clerkUserId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        const clerkUserId =
          (invoice.metadata as any)?.userId ??
          (invoice.lines?.data?.[0]?.metadata as any)?.userId;
        if (clerkUserId) {
          const clerk = await clerkClient();
          await clerk.users.updateUser(clerkUserId, {
            publicMetadata: { isPro: false },
          });
          console.log('⚠️ Payment failed → unset Pro:', clerkUserId);
        } else {
          console.warn('⚠️ payment_failed without clerk userId');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;

        const clerkUserId = (sub.metadata as any)?.userId;
        if (clerkUserId) {
          const clerk = await clerkClient();
          await clerk.users.updateUser(clerkUserId, {
            publicMetadata: { isPro: false },
          });
          console.log('⚠️ Subscription deleted → unset Pro:', clerkUserId);
        } else {
          console.warn('⚠️ subscription.deleted without clerk userId');
        }
        break;
      }

      default: {
        // Optional: log unhandled events while testing
        // console.log(`➡️ Unhandled event type: ${event.type}`);
        break;
      }
    }

    return new Response('ok', { status: 200 });
  } catch (err: any) {
    console.error('❌ Webhook handler error:', err?.message || err);
    return new Response('Server error', { status: 500 });
  }
}
