import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { PageTitle } from "@/components/section";
import { allPosts } from "@/lib/blog";

export const dynamicParams = false;

export function generateStaticParams() {
  return allPosts().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = allPosts().find((p) => p.slug === slug);
  return { title: post?.title ?? "Post", robots: post && !post.index ? { index: false } : undefined };
}

export default async function Post({ params }: Props) {
  const { slug } = await params;
  const post = allPosts().find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <>
      <PageTitle label={post.date} title={post.title} />
      <article className="container-site prose-site pb-16">
        <MDXRemote source={post.body} />
      </article>
    </>
  );
}
