'use client';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { currentUser } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server'; // ✅ Import

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(req: NextRequest) {
  const { priceId } = await req.json();
  const user = await currentUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const userId = user.id;

  try {
    const customer = await stripe.customers.create({
      metadata: { clerkUserId: userId },
    });

    const session = await stripe.checkout.sessions.create({
  customer: customer.id,
  line_items: [{ price: priceId, quantity: 1 }],
  mode: 'subscription',
  success_url: 'http://localhost:3000/dashboard',
  cancel_url: 'http://localhost:3000/pricing',
});

// ✅ Mark user as Pro — ONCE, with correct key
const client = await clerkClient();
await client.users.updateUserMetadata(userId, {
  privateMetadata: {
    isPro: true,
    stripeCustomerId: customer.id,
    subscriptionStatus: 'active',
  },
});

return new Response(JSON.stringify({ url: session.url }), {
  headers: { 'Content-Type': 'application/json' },
});
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response('Failed to create checkout', { status: 500 });
  }
}