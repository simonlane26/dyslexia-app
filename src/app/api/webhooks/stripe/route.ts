// src/app/api/webhooks/stripe/route.ts
import 'server-only';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get('stripe-signature');

  if (!webhookSecret) return new Response('Missing STRIPE_WEBHOOK_SECRET', { status: 500 });
  if (!signature) return new Response('Bad Request', { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('Signature verify failed:', err?.message);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        const clerkUserId =
          (s.metadata as any)?.userId || (s.client_reference_id as string | undefined);
        if (clerkUserId) {
          const clerk = clerkClient;
          await clerk.clerkClient.users.updateUser(clerkUserId, {
            publicMetadata: {
              isPro: true,
              proSince: new Date().toISOString(),
              stripeCustomerId: s.customer as string | undefined,
            },
          });
        }
        break;
      }
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        const clerkUserId = (inv.metadata as any)?.userId;
        if (clerkUserId) {
          const clerk = clerkClient;
          await clerk.clerkClient.users.updateUser(clerkUserId, { publicMetadata: { isPro: false } });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = (sub.metadata as any)?.userId;
        if (clerkUserId) {
          const clerk = clerkClient;
          await clerk.clerkClient.users.updateUser(clerkUserId, { publicMetadata: { isPro: false } });
        }
        break;
      }
      default:
        // no-op
        break;
    }
    return new Response('ok', { status: 200 });
  } catch (err: any) {
    console.error('Webhook handler error:', err?.message || err);
    return new Response('Server error', { status: 500 });
  }
}
