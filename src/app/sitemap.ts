import type { MetadataRoute } from "next";
import { indexedPosts } from "@/lib/blog";
import { cases } from "@/lib/cases";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/work", "/philosophy", "/contact", "/blog"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}` })),
    ...cases.map((c) => ({ url: `${site.url}/work/${c.slug}` })),
    ...indexedPosts().map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date })),
  ];
}
