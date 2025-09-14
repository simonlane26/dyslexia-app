// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public (no auth required)
const isPublic = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/success(.*)',
  '/cookies(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/api/webhooks/(.*)', // webhooks must be public
]);

// Auth pages (we'll redirect signed-in users away)
const isAuthPage = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

// NOTE: handler is async so we can await auth()
export default clerkMiddleware(async (auth, req) => {
  // If signed in and on auth pages, send them home
  const { userId, redirectToSignIn } = await auth();

  if (userId && isAuthPage(req)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If route is public, allow through
  if (isPublic(req)) return NextResponse.next();

  // Route is protected → if not signed in, redirect to sign-in
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Signed in → continue
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)', // all pages except static
    '/api/(.*)',                   // all API routes
  ],
};





