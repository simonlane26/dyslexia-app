// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👇 use the TOP-LEVEL flag in Next 15
  typedRoutes: false,

  eslint: { ignoreDuringBuilds: true },

  // keep any rewrites you already had
  async rewrites() {
    return [
      { source: "/api/webhooks/clerk", destination: "/api/webhooks/clerk" },
      { source: "/api/webhooks/stripe", destination: "/api/webhooks/stripe" },
    ];
  },

  // (optional escape hatch while you’re cleaning things up)
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
