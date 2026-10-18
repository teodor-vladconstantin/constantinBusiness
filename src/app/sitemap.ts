import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts-db";
import { getProjects } from "@/lib/projects-db";
import { site } from "@/lib/site";

// Content comes from the database, so the sitemap refreshes every 5 minutes.
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const posts = await getPosts();
  const pages = ["", "/work", "/philosophy", "/contact", "/blog"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}` })),
    ...projects.map((p) => ({ url: `${site.url}/work/${p.slug}` })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date })),
  ];
}
