import { ogSize, renderOg } from "@/lib/og";
import { allPosts } from "@/lib/blog";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Blog post";

export function generateStaticParams() {
  return allPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = allPosts().find((p) => p.slug === slug);
  return renderOg({ label: post?.date ?? "Blog", title: post?.title ?? "Blog" });
}
