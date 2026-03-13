import 'server-only';
import { auth, currentUser } from '@clerk/nextjs/server';
import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function getSecret() {
  const s = process.env.EXTENSION_TOKEN_SECRET;
  if (!s) throw new Error('EXTENSION_TOKEN_SECRET not set');
  return new TextEncoder().encode(s);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store', ...CORS } });
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401, headers: CORS });
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? '';

  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1y')
    .sign(getSecret());

  return NextResponse.json({ token, email }, { headers: CORS });
}
