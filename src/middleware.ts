import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicPage = createRouteMatcher([
  '/',
  '/pricing',
  '/privacy',
  '/terms',
  '/cookies',
  '/success',
  '/schools-privacy',
  '/accessibility',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
]);

// API routes that don't require authentication
const isPublicApi = createRouteMatcher([
  '/api/simplify',
  '/api/simplify-page',
  '/api/check-message',
  '/api/tone-check',
  '/api/coach/rewrite-sentence',
  '/api/coach',
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Public API endpoints — no auth required
  if (isPublicApi(req)) return NextResponse.next();

  // Protected API endpoints — return JSON 401 (never redirect)
  if (pathname.startsWith('/api/')) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Public pages — no auth required
  if (isPublicPage(req)) return NextResponse.next();

  // All other pages are protected — Clerk redirects to sign-in if needed
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
