// middleware.ts (root)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public routes — no auth, no Clerk boot
const isPublic = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/privacy(.*)',
   "/api/simplify",
  '/terms(.*)',
  '/cookies(.*)',
  '/api/webhooks/(.*)',
  // add these for debugging:
  '/api/clerk-debug',
  '/api/health',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublic(req)) return NextResponse.next();

  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // all pages except static files and _next
    '/((?!_next|.*\\..*).*)',
    // all api routes
    '/api/(.*)',
  ],
};
