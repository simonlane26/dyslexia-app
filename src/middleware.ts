// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAuthPage = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (mwAuth, req) => {
  const { pathname } = req.nextUrl;

if (process.env.NODE_ENV !== "production") return; // 👈 skip everythin

  // Never touch Stripe webhooks
  if (pathname.startsWith("/api/webhooks/stripe")) return;
if (pathname.startsWith('/sso-callback')) return;
  // Require auth on selected APIs (await the async mwAuth())
  if (
    pathname.startsWith("/api/simplify") ||
    pathname.startsWith("/api/text-to-speech")
  ) {
    const { userId } = await mwAuth();
    if (!userId) {
      return Response.redirect(new URL("/sign-in", req.url));
    }
  }

  // Redirect signed-in users away from auth pages
  const { userId } = await mwAuth();
  if (userId && isAuthPage(req)) {
    const target = pathname.startsWith("/sign-up") ? "/success" : "/";
    return Response.redirect(new URL(target, req.url));
  }

  // Continue
  return;
});

export const config = {
  matcher: [
    // All pages (exclude static files and Next internals)
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    // All API routes
    "/(api|trpc)(.*)",
  ],
};



