// src/app/api/clerk-debug/route.ts
import 'server-only';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const clean = (s?: string | null) => (s ?? '').trim().replace(/^"(.*)"$/, '$1');

export async function GET() {
  const pk = clean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const sk = clean(process.env.CLERK_SECRET_KEY);

  return new NextResponse(JSON.stringify({
    publishableKey: { present: !!pk, prefix: pk?.slice(0, 8), len: pk?.length ?? 0 },
    secretKey:     { present: !!sk, prefix: sk?.slice(0, 8), len: sk?.length ?? 0 },
  }), { headers: { 'content-type': 'application/json' }});
}
