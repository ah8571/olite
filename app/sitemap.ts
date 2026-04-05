import type { MetadataRoute } from "next";

import { blogPages } from "@/lib/blog-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://olite.dev";

  return [
    "",
    "/blog",
    "/what-olite-checks",
    "/tools/accessibility",
    "/tools/cookie-scanner",
    "/tools/privacy",
    ...blogPages.map((page) => page.href)
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8
  }));
}