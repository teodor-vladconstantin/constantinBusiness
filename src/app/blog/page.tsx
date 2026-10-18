import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle, Section } from "@/components/section";
import { getPosts } from "@/lib/posts-db";

export const metadata: Metadata = { title: "Blog" };

export default async function Blog() {
  const posts = await getPosts();
  return (
    <>
      <PageTitle label="Blog" title="Notes" />
      <Section n="01" title="Posts">
        {posts.length === 0 ? (
          <p className="prose-site text-muted">No posts yet.</p>
        ) : (
          <ul className="border-t border-line">
            {posts.map((p) => (
              <li key={p.slug} className="border-b border-line">
                <Link href={`/blog/${p.slug}`} className="row-invert grid grid-cols-12 gap-x-3 px-1 py-2">
                  <span className="label col-span-3">{p.date}</span>
                  <span className="col-span-9">
                    {p.title}
                    {p.excerpt && <span className="mt-1 block text-[15px] leading-snug text-muted">{p.excerpt}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
