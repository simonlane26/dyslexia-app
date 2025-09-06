// src/lib/origin.ts
import { headers } from 'next/headers';

export function getOrigin() {
  // Prefer explicit NEXT_PUBLIC_APP_URL (for production),
  // else use Vercel preview URL, else fallback to localhost
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const env = process.env.NEXT_PUBLIC_APP_URL || vercel || 'http://localhost:3000';
  return env;
}
