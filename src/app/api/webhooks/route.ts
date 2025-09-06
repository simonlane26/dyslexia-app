// src/app/api/webhooks/route.ts
import { NextRequest } from 'next/server';
import { Webhook, WebhookRequiredHeaders } from 'svix';
import { clerkClient } from '@clerk/nextjs/server';
import Stripe from 'stripe';

// ✅ Ensure this is set in .env.local
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  throw new Error('Missing WEBHOOK_SECRET in environment');
}

export async function POST(req: NextRequest) {
  try {
    // Get the headers
    const headers = req.headers as unknown as Record<string, string>;
    const svix_id = headers['svix-id'];
    const svix_timestamp = headers['svix-timestamp'];
    const svix_signature = headers['svix-signature'];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('❌ Missing Svix headers');
      return new Response('Error: Missing Svix headers', { status: 400 });
    }

    // Extract the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret
    if (!WEBHOOK_SECRET) {
      console.error('❌ WEBHOOK_SECRET is not defined');
      return new Response('Error: Webhook secret not configured', { status: 500 });
    }
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      } as WebhookRequiredHeaders) as WebhookEvent;
    } catch (err) {
      console.error('❌ Failed to verify webhook:', err);
      return new Response('Error: Invalid signature', { status: 400 });
    }

    const { type, data } = evt;

if (evt.type === "checkout.session.completed") {
  const session = evt.data.object as Stripe.Checkout.Session;

  // Prefer metadata, fallback to client_reference_id
  const userId = session.metadata?.userId || session.client_reference_id;

  console.log("📦 Session metadata:", session.metadata);
  console.log("👤 Client Reference ID:", session.client_reference_id);

  if (!userId) {
    console.warn("⚠️ No userId found in checkout.session.completed");
    return new Response("No userId in session", { status: 400 });
  }

  try {
    // ✅ Update user in Clerk
    const clerk = await clerkClient();
    await clerk.users.updateUser(userId, {
      publicMetadata: {
        isPro: true,
        proSince: new Date().toISOString(),
      },
    });

    console.log(`✅ User ${userId} upgraded to Pro`);
  } catch (err) {
    console.error('❌ Failed to update user metadata:', err);
    return new Response('Error updating user', { status: 500 });
  }
}

    // ✅ Always return 200 for Stripe
    return new Response(null, { status: 200 });
  } catch (err) {
    console.error('❌ Unexpected error in webhook:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}

type WebhookEvent = {
  data: Record<string, any>;
  type: string;
};