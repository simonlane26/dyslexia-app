// src/app/api/create-subscription/route.ts
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { getOrigin } from '@/lib/origin';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // apiVersion optional

export async function POST(req: NextRequest) {
  // ✅ Get the signed-in user (server-side)
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get priceId from client body
  const { priceId } = await req.json().catch(() => ({ priceId: undefined as string | undefined }));
  if (!priceId) {
    return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
  }

  const origin = getOrigin();

  try {
    // (Optional) You can let Stripe auto-create the customer.
    // If you DO want a customer up-front, attach the Clerk userId in metadata.
    // const customer = await stripe.customers.create({ metadata: { clerkUserId: userId } });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      // customer: customer.id, // optional
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      // ✅ Pass the Clerk userId so the WEBHOOK can flip isPro after successful payment
      metadata: { userId: String(userId) },
      client_reference_id: String(userId),
      subscription_data: { metadata: { userId: String(userId) } },
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('❌ create-subscription error', {
      message: error?.message,
      code: error?.code,
      type: error?.type,
      raw: error?.raw?.message,
    });
    return NextResponse.json(
      { error: error?.raw?.message ?? error?.message ?? 'Stripe error' },
      { status: 500 }
    );
  }
}
