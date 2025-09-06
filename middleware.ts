// middleware.ts (PROJECT ROOT)
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware((auth, req) => {
  console.log("🔐 clerkMiddleware hit:", req.nextUrl.pathname);
});

export const config = {
  matcher: [
    "/api/(.*)",                   // all API routes (e.g., /api/whoami, /api/checkout)
    "/((?!.+\\.[\\w]+$|_next).*)", // all pages; exclude _next/* and static assets
  ],
};
