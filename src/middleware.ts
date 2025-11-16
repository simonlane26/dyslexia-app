// src/middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public pages (add/remove as needed)
const PUBLIC_PATHS = [
  '/',
  '/pricing',
  '/privacy',
  '/terms',
  '/cookies',
  '/success',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((pattern) => new RegExp(`^${pattern}$`).test(pathname));
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip Next internals & static assets
  if (pathname.startsWith('/_next') || /\.[\w-]+$/.test(pathname)) {
    return NextResponse.next();
  }

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const session = await auth();

  if (pathname.startsWith('/api/')) {
    // Allow anonymous access to /api/simplify (with IP-based rate limiting)
    if (pathname === '/api/simplify') {
      return NextResponse.next();
    }
    // Other APIs: never redirect; return JSON 401 if unauthenticated
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // App pages: redirect to Clerk sign in if needed
  if (!session.userId) {
    return session.redirectToSignIn({ returnBackUrl: req.url });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // all app routes except static files
    '/api/(.*)',              // all API routes
  ],
};
