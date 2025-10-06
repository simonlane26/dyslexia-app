// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,                 // Next 15 only; if on 14 use: experimental: { typedRoutes: false }
  eslint: { ignoreDuringBuilds: true },

  // Remove identity rewrites; keep only if mapping to different paths.
  // Example: expose cleaner incoming webhook URLs:
  async rewrites() {
    return [
      // { source: "/webhooks/clerk", destination: "/api/webhooks/clerk" },
      // { source: "/webhooks/stripe", destination: "/api/webhooks/stripe" },
    ];
  },

  // If you’re on Next 14 instead of 15, uncomment this and remove the top-level typedRoutes:
  // experimental: {
  //   typedRoutes: false,
  // },
};

export default nextConfig;
