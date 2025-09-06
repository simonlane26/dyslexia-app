// src/app/api/webhooks/stripe/route.ts
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(req: NextRequest) {
  try {
    console.log('🔄 Webhook received');
    
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return new Response('Webhook error', { status: 400 });
    }

    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response('Webhook error', { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    console.log('✅ Event type:', event.type);

    // Handle checkout session completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('💰 Session ID:', session.id);
      console.log('👤 Client reference ID:', session.client_reference_id);

      const userId = session.client_reference_id;
      
      if (userId) {
        console.log('🎯 Updating user to Pro:', userId);
        const clerk = await clerkClient();
        await clerk.users.updateUser(userId, {
          publicMetadata: {
            isPro: true,
            proSince: new Date().toISOString(),
            stripeCustomerId: session.customer,
          }
        });
        console.log('✅ User updated to Pro successfully');
      }
    }

    return new Response('Webhook processed', { status: 200 });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response('Webhook error', { status: 400 });
  }
}