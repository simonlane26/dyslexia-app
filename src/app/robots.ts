// app/robots.ts
import { type MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private/app-only stuff out of the index
        disallow: [
          "/api/",
          "/app",
          "/app/*",
          "/sign-in",
          "/sign-in/*",
          "/sign-up",
          "/sign-up/*",
          "/sso-callback",
          "/sso-callback/*",
          "/success",
        ],
      },
      // Explicit allow rules for AI crawlers/answer engines. Functionally
      // redundant with the wildcard rule above (nothing blocks them), but
      // explicit beats implicit for tools that check for named allowances.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    // Point crawlers to your sitemap
    sitemap: "https://www.dyslexiawrite.com/sitemap.xml",
    host: "https://www.dyslexiawrite.com",
  };
}
