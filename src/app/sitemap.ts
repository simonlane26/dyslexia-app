// app/sitemap.ts
import { type MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.dyslexiawrite.com";

  // Static pages - only include pages that actually exist
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/pricing`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/assist`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/terms`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/cookies`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  // Example: include blog posts if you have them
  // If you store posts in a CMS or local MDX, map them here.
  // const posts = await getAllPosts(); // title, slug, updatedAt
  const posts: MetadataRoute.Sitemap = []; // fill from your data source
  // Example:
  // const posts = allPosts.map(p => ({
  //   url: `${base}/blog/${p.slug}`,
  //   lastModified: new Date(p.updatedAt),
  //   changeFrequency: "monthly" as const,
  //   priority: 0.6,
  // }));

  return [...staticRoutes, ...posts];
}
