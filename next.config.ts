import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information sent with requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Force HTTPS for 2 years, include subdomains
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Restrict browser feature access
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "geolocation=()",
      "payment=()",
      // microphone is used for voice dictation — allow self only
      "microphone=(self)",
    ].join(", "),
  },
  // Content Security Policy
  // Note: unsafe-inline on script-src is required for Next.js inline data scripts,
  // Google Analytics, and JSON-LD blocks. A nonce-based CSP would be the next hardening step.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js needs unsafe-inline + unsafe-eval; GA and JSON-LD need unsafe-inline
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      // React inline styles are used throughout the app
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      // Images from own domain, data URIs (base64 in doc decoder), blob (TTS audio)
      "img-src 'self' data: blob: https:",
      // API connections: Clerk, OpenAI, OpenRouter, ElevenLabs, Supabase, GA
      [
        "connect-src 'self'",
        "https://*.clerk.com",
        "https://*.clerk.accounts.dev",
        "https://api.clerk.dev",
        "https://api.openai.com",
        "https://openrouter.ai",
        "https://api.elevenlabs.io",
        "https://www.google-analytics.com",
        "https://stats.g.doubleclick.net",
      ].join(" "),
      // Clerk uses Cloudflare Turnstile; block all other frames
      "frame-src https://challenges.cloudflare.com https://accounts.google.com",
      // Prevent this site from being embedded anywhere
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  eslint: { ignoreDuringBuilds: true },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  async rewrites() {
    return [];
  },
};

export default nextConfig;
