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

// API routes that handle their own auth (extension JWT or Clerk session)
// Must NOT early-return so Clerk attaches session data before the route runs
const isSelfAuthApi = createRouteMatcher([
  '/api/simplify',
  '/api/simplify-page',
]);

// API routes that are fully public (no auth, no session needed)
const isPublicApi = createRouteMatcher([
  '/api/check-message',
  '/api/tone-check',
  '/api/coach/rewrite-sentence',
  '/api/coach',
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Fully public API endpoints — skip auth entirely
  if (isPublicApi(req)) return NextResponse.next();

  // Self-authenticating endpoints — Clerk processes session but doesn't require it
  // The route handler checks Bearer JWT or Clerk userId itself
  if (isSelfAuthApi(req)) {
    await auth(); // ensures session is attached to the request
    return NextResponse.next();
  }

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
