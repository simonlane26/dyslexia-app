// middleware.ts (PROJECT ROOT)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 👇 Match your auth pages
const isAuthPage = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  console.log("🔐 clerkMiddleware hit:", req.nextUrl.pathname);

  // If the user is signed in and visits /sign-in or /sign-up → redirect them
  if ((await auth()).userId && isAuthPage(req)) {
    // Decide where to send them:
    //   - after sign-up → /success
    //   - after sign-in → /
    const target =
      req.nextUrl.pathname.startsWith("/sign-up") ? "/success" : "/";
    return Response.redirect(new URL(target, req.url));
  }

  // Otherwise let the request through
});

export const config = {
  matcher: [
    "/api/(.*)",                   // all API routes (e.g., /api/whoami, /api/checkout)
    "/((?!.+\\.[\\w]+$|_next).*)", // all pages; exclude _next/* and static assets
  ],
};
