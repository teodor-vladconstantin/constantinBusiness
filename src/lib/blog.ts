import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const dir = path.join(process.cwd(), "content/blog");

export type Post = { slug: string; title: string; date: string; index: boolean; body: string };

export function allPosts(): Post[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);
      return { slug: f.replace(/\.mdx$/, ""), title: String(data.title), date, index: data.index !== false, body: content };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

// Posts with `index: false` stay reachable by URL but out of the list, feed and sitemap.
export const indexedPosts = () => allPosts().filter((p) => p.index);
