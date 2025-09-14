// app/robots.ts
import { type MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private/app-only stuff out of the index
        disallow: ["/api/", "/app", "/app/*", "/sign-in", "/sign-up"],
      },
    ],
    // Point crawlers to your sitemap
    sitemap: "https://www.dyslexiawrite.com/sitemap.xml",
    // (Optional) host: "www.dyslexiawrite.com",
  };
}
