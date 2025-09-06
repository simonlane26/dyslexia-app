// src/app/api/webhooks/clerk/route.ts
import 'server-only';
import { NextRequest } from 'next/server';
import { Webhook } from 'svix';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing Svix headers', { status: 400 });
  }

  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return new Response('Server not configured', { status: 500 });

  const payload = await req.text(); // raw body required
  const wh = new Webhook(secret);

  try {
    wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('Clerk webhook verify failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  // Optionally parse payload & handle user.created/updated events:
  // const evt = JSON.parse(payload);
  // if (evt.type === 'user.created') { ... }

  return new Response('ok', { status: 200 });
}
