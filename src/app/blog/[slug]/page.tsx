import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { PageTitle } from "@/components/section";
import { getPost, getPosts } from "@/lib/posts-db";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post?.title ?? "Post", description: post?.excerpt || undefined };
}

export default async function Post({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return (
    <>
      <PageTitle label={post.date} title={post.title} />
      <article className="container-site prose-site pb-16">
        <Markdown source={post.body} />
      </article>
    </>
  );
}
