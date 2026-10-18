import { ogSize, renderOg } from "@/lib/og";
import { getPost, getPosts } from "@/lib/posts-db";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Blog post";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return renderOg({ label: post?.date ?? "Blog", title: post?.title ?? "Blog" });
}
