import type { MetadataRoute } from "next";
import { indexedPosts } from "@/lib/blog";
import { getProjects } from "@/lib/projects-db";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const pages = ["", "/work", "/philosophy", "/contact", "/blog"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}` })),
    ...projects.map((p) => ({ url: `${site.url}/work/${p.slug}` })),
    ...indexedPosts().map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date })),
  ];
}
