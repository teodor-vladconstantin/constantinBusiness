import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { adminListPosts } from "@/lib/posts-admin";

export const dynamic = "force-dynamic";

export default async function AdminBlog() {
  await requireAdmin();
  const posts = await adminListPosts();
  return (
    <>
      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="title">Blog</h1>
        <Link href="/admin/blog/new" className="bg-accent px-2 py-1 font-mono text-[12px] uppercase tracking-[0.08em] !text-black">
          New post
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className="prose-site text-muted">No posts yet.</p>
      ) : (
        <ul className="border-t border-line">
          {posts.map((p) => (
            <li key={p.id} className="border-b border-line">
              <Link href={`/admin/blog/${p.id}`} className="row-invert grid grid-cols-12 gap-x-3 px-1 py-2">
                <span className="label col-span-4 md:col-span-2">{(p.published_at ?? p.created_at).slice(0, 10)}</span>
                <span className="col-span-8 md:col-span-8">{p.title}</span>
                <span className="label col-span-12 md:col-span-2 md:text-right">{p.status === "published" ? "Published" : "Draft"}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
