# Phase 3: Blog editor. Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The owner writes, previews, publishes and deletes blog posts from `/admin/blog`. The public blog, the post pages, the RSS feed and the sitemap read from Supabase.

**Architecture:** A `posts` table (public read of published rows through RLS). Posts are Markdown rendered by `react-markdown` with `remark-gfm`, which does not render raw HTML, so a post cannot run code. Pure functions in `src/lib/post-mapper.ts` validate the form and carry the tests. The data and admin layers follow phase 2. Images reuse the `images` bucket under `posts/<slug>/`.

**Tech Stack:** Next.js 16.4.1, React 19, TypeScript, Tailwind 4, `@supabase/supabase-js`, `react-markdown` 10.1.0, `remark-gfm` 4.0.1, Vitest 5.0.5.

## Global Constraints

- Style: dark, Swiss, bg #111113, text #F4F4F5, secondary #A1A1AA, hairlines #2A2A2E, accent #EAB308, one accent per screen, no gradients, glow, blur or shadows, radius 0 to 2px.
- Copy: short sentences, no em dashes, no negation-then-positive structure.
- Commits: no `Co-Authored-By` trailer. Branch `feature/blog-cms`, merged to `main` after the checks.
- Never open `.env*` files. Admin pages and actions call `requireAdmin()` first. Service role stays in server-only code.
- Markdown only. No MDX and no raw HTML from the database. Links open with `rel="noopener noreferrer"`. Images must be `https`.
- Post fields: slug `^[a-z0-9]+(-[a-z0-9]+)*$`, title 1 to 150 characters, excerpt up to 300, body up to 50000, status `draft` or `published`, publish date `YYYY-MM-DD`.
- A post is public only when `status = 'published'` and `published_at <= now()`.
- Images: png, jpeg or webp, at most 5 MB. Server Action body limit is already 12 MB.

## File Structure

| File | Responsibility |
|---|---|
| `supabase/migrations/0003_posts.sql` | `posts` table and RLS policy |
| `src/lib/post-mapper.ts`, `src/lib/post-mapper.test.ts` | `parsePostForm`, `postFromRow`, tests (pure) |
| `src/components/markdown.tsx` | Safe Markdown renderer in the site style |
| `src/lib/posts-db.ts` | Public reads: `getPosts`, `getPost` |
| `src/lib/posts-admin.ts` | Admin reads and writes |
| `src/lib/projects-admin.ts` | `uploadImage` takes a folder, so posts reuse it |
| `src/app/admin/blog/page.tsx`, `[id]/page.tsx`, `[id]/post-form.tsx`, `actions.ts` | List, editor with preview, actions |
| `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/[slug]/opengraph-image.tsx`, `src/app/blog/rss.xml/route.ts`, `src/app/sitemap.ts` | Read from the database |
| `src/lib/blog.ts`, `content/blog/` | Removed. Dependencies `next-mdx-remote` and `gray-matter` removed |

---

### Task 1: Table and policy

**Files:**
- Create: `supabase/migrations/0003_posts.sql`

- [ ] **Step 1: Create the migration**

```sql
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 150),
  excerpt text not null default '' check (char_length(excerpt) <= 300),
  body_md text not null default '' check (char_length(body_md) <= 50000),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "public reads published posts" on public.posts
  for select using (status = 'published' and published_at is not null and published_at <= now());
```

- [ ] **Step 2: Run it in the Supabase SQL editor.** Expected: "Success. No rows returned".

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0003_posts.sql
git commit -m "Add the posts table"
```

---

### Task 2: Post mapper (TDD)

**Files:**
- Create: `src/lib/post-mapper.ts`
- Test: `src/lib/post-mapper.test.ts`

**Interfaces:**
- Produces: `type PostRow = { id; slug; title; excerpt; body_md; status: "draft" | "published"; published_at: string | null; created_at; updated_at }`, `type Post = { slug: string; title: string; excerpt: string; body: string; date: string }` (`date` is `YYYY-MM-DD`), `postFromRow(r: PostRow): Post`, `type PostFormFields = { slug; title; excerpt; body; status; publishedAt: string }`, `parsePostForm(f: PostFormFields, today?: string): { ok: true; value: { slug; title; excerpt; body_md; status; published_at: string | null } } | { ok: false; error: string }`, `slugFromTitle(title: string): string`.

- [ ] **Step 1: Write the failing test** `src/lib/post-mapper.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { parsePostForm, postFromRow, slugFromTitle, type PostFormFields, type PostRow } from "@/lib/post-mapper";

const form: PostFormFields = { slug: "my-first-post", title: "My first post", excerpt: "Short.", body: "Hello.", status: "draft", publishedAt: "" };

describe("slugFromTitle", () => {
  it("lowercases, strips accents and joins words with hyphens", () => {
    expect(slugFromTitle("  Că ce construiesc, în 2026! ")).toBe("ca-ce-construiesc-in-2026");
  });
  it("returns an empty string for a title without letters or digits", () => {
    expect(slugFromTitle("!!!")).toBe("");
  });
});

describe("parsePostForm", () => {
  it("parses a draft and keeps the date empty", () => {
    const r = parsePostForm(form, "2026-10-18");
    expect(r).toEqual({ ok: true, value: { slug: "my-first-post", title: "My first post", excerpt: "Short.", body_md: "Hello.", status: "draft", published_at: null } });
  });
  it("uses today's date when publishing without a date", () => {
    const r = parsePostForm({ ...form, status: "published" }, "2026-10-18");
    expect(r.ok && r.value.published_at).toBe("2026-10-18T00:00:00.000Z");
  });
  it("keeps a given publish date", () => {
    const r = parsePostForm({ ...form, status: "published", publishedAt: "2026-01-05" }, "2026-10-18");
    expect(r.ok && r.value.published_at).toBe("2026-01-05T00:00:00.000Z");
  });
  it("builds the slug from the title when the slug is empty", () => {
    const r = parsePostForm({ ...form, slug: "", title: "Hello World" }, "2026-10-18");
    expect(r.ok && r.value.slug).toBe("hello-world");
  });
  it("rejects a bad slug", () => {
    expect(parsePostForm({ ...form, slug: "Bad Slug" }, "2026-10-18").ok).toBe(false);
  });
  it("rejects an empty or long title", () => {
    expect(parsePostForm({ ...form, title: " " }, "2026-10-18").ok).toBe(false);
    expect(parsePostForm({ ...form, title: "a".repeat(151) }, "2026-10-18").ok).toBe(false);
  });
  it("rejects a long excerpt or body", () => {
    expect(parsePostForm({ ...form, excerpt: "a".repeat(301) }, "2026-10-18").ok).toBe(false);
    expect(parsePostForm({ ...form, body: "a".repeat(50001) }, "2026-10-18").ok).toBe(false);
  });
  it("rejects an unknown status and a malformed date", () => {
    expect(parsePostForm({ ...form, status: "archived" }, "2026-10-18").ok).toBe(false);
    expect(parsePostForm({ ...form, status: "published", publishedAt: "05/01/2026" }, "2026-10-18").ok).toBe(false);
  });
  it("requires a body to publish", () => {
    expect(parsePostForm({ ...form, status: "published", body: "  " }, "2026-10-18").ok).toBe(false);
  });
});

describe("postFromRow", () => {
  it("maps the row and formats the date", () => {
    const row: PostRow = { id: "1", slug: "a", title: "A", excerpt: "e", body_md: "b", status: "published", published_at: "2026-10-18T00:00:00+00:00", created_at: "x", updated_at: "y" };
    expect(postFromRow(row)).toEqual({ slug: "a", title: "A", excerpt: "e", body: "b", date: "2026-10-18" });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/post-mapper.test.ts`
Expected: FAIL, "Failed to resolve import @/lib/post-mapper".

- [ ] **Step 3: Implement** `src/lib/post-mapper.ts`

```ts
export type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Post = { slug: string; title: string; excerpt: string; body: string; date: string };

export const postFromRow = (r: PostRow): Post => ({
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt,
  body: r.body_md,
  date: (r.published_at ?? r.created_at).slice(0, 10),
});

export function slugFromTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type PostFormFields = { slug: string; title: string; excerpt: string; body: string; status: string; publishedAt: string };

export type PostFormResult =
  | { ok: true; value: { slug: string; title: string; excerpt: string; body_md: string; status: "draft" | "published"; published_at: string | null } }
  | { ok: false; error: string };

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parsePostForm(f: PostFormFields, today: string = new Date().toISOString().slice(0, 10)): PostFormResult {
  const title = f.title.trim();
  if (title.length < 1 || title.length > 150) return { ok: false, error: "Title must be 1 to 150 characters." };
  const slug = f.slug.trim() || slugFromTitle(title);
  if (!SLUG.test(slug)) return { ok: false, error: "Slug uses lowercase letters, digits and hyphens." };
  const excerpt = f.excerpt.trim();
  if (excerpt.length > 300) return { ok: false, error: "The summary can have up to 300 characters." };
  const body = f.body.trim();
  if (body.length > 50000) return { ok: false, error: "The post can have up to 50000 characters." };
  if (f.status !== "draft" && f.status !== "published") return { ok: false, error: "Choose draft or published." };

  let published_at: string | null = null;
  if (f.status === "published") {
    if (!body) return { ok: false, error: "A published post needs a body." };
    const day = f.publishedAt.trim() || today;
    if (!DATE.test(day) || Number.isNaN(Date.parse(day))) return { ok: false, error: "Use the date format YYYY-MM-DD." };
    published_at = `${day}T00:00:00.000Z`;
  }
  return { ok: true, value: { slug, title, excerpt, body_md: body, status: f.status, published_at } };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/post-mapper.ts src/lib/post-mapper.test.ts
git commit -m "Add the post mapper with tests"
```

---

### Task 3: Markdown renderer

**Files:**
- Create: `src/components/markdown.tsx`
- Modify: `package.json` (dependencies)

**Interfaces:**
- Produces: `Markdown({ source: string }): JSX.Element`. Works in server and client components. It has no hooks.

- [ ] **Step 1: Install**

Run: `npm i --save-exact react-markdown@10.1.0 remark-gfm@4.0.1`

- [ ] **Step 2: Create `src/components/markdown.tsx`**

```tsx
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// react-markdown does not render raw HTML, and its default URL filter drops unsafe protocols.
const components: Components = {
  h2: ({ children }) => <h2 className="mb-2 mt-10 font-heading text-[28px] font-bold leading-none tracking-[-0.03em]">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-8 font-heading text-[22px] font-bold leading-none tracking-[-0.03em]">{children}</h3>,
  p: ({ children }) => <p className="mb-3">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 list-disc pl-3">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal pl-3">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
  a: ({ href, children }) => (
    <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="underline decoration-accent underline-offset-4">
      {children}
    </a>
  ),
  blockquote: ({ children }) => <blockquote className="mb-3 border-l border-line pl-2 text-muted">{children}</blockquote>,
  hr: () => <hr className="my-6 border-line" />,
  code: ({ children, className }) => <code className={`font-mono text-[0.9em] ${className ?? ""}`}>{children}</code>,
  pre: ({ children }) => <pre className="mb-3 overflow-x-auto border border-line p-2 font-mono text-[14px] leading-snug">{children}</pre>,
  img: ({ src, alt }) =>
    typeof src === "string" && src.startsWith("https://") ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ""} loading="lazy" className="mb-3 h-auto max-w-full border border-line" />
    ) : null,
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full border-collapse text-left text-[15px]">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-line px-1 py-1 font-bold">{children}</th>,
  td: ({ children }) => <td className="border-b border-line px-1 py-1">{children}</td>,
};

export function Markdown({ source }: { source: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {source}
    </ReactMarkdown>
  );
}
```

- [ ] **Step 3: Typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add package.json package-lock.json src/components/markdown.tsx
git commit -m "Add the Markdown renderer"
```

---

### Task 4: Data layers and image upload folder

**Files:**
- Create: `src/lib/posts-db.ts`, `src/lib/posts-admin.ts`
- Modify: `src/lib/projects-admin.ts`, `src/app/admin/projects/actions.ts`

**Interfaces:**
- `getPosts(): Promise<Post[]>` (published and dated up to now, newest first), `getPost(slug: string): Promise<Post | null>` from `posts-db.ts`.
- `adminListPosts(): Promise<PostRow[]>` (newest first by `created_at`), `adminGetPost(id: string): Promise<PostRow | null>`, `adminSavePost(id: string | null, value: PostValue): Promise<void>`, `adminDeletePost(id: string): Promise<void>`, where `type PostValue = { slug; title; excerpt; body_md; status: "draft" | "published"; published_at: string | null }`.
- `uploadImage(dir: string, file: File)` in `projects-admin.ts` now takes the full folder, for example `projects/joben` or `posts/my-post`. Callers in `src/app/admin/projects/actions.ts` pass `` `projects/${slug}` ``.

- [ ] **Step 1: Create `src/lib/posts-db.ts`**

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { postFromRow, type Post, type PostRow } from "@/lib/post-mapper";

// Anon client. Row level security lets it read published posts dated up to now.
const client = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await client().from("posts").select("*").order("published_at", { ascending: false });
  if (error) throw new Error("Could not load posts");
  return (data as PostRow[]).map(postFromRow);
}

export async function getPost(slug: string): Promise<Post | null> {
  const { data, error } = await client().from("posts").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error("Could not load the post");
  return data ? postFromRow(data as PostRow) : null;
}
```

- [ ] **Step 2: Create `src/lib/posts-admin.ts`**

```ts
import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { PostRow } from "@/lib/post-mapper";

export type PostValue = { slug: string; title: string; excerpt: string; body_md: string; status: "draft" | "published"; published_at: string | null };

const saveError = (message: string) => (message.includes("duplicate") ? "That slug is already used." : "Could not save the post.");

export async function adminListPosts(): Promise<PostRow[]> {
  const { data, error } = await supabaseAdmin().from("posts").select("*").order("created_at", { ascending: false });
  if (error) throw new Error("Could not load posts");
  return data as PostRow[];
}

export async function adminGetPost(id: string): Promise<PostRow | null> {
  const { data } = await supabaseAdmin().from("posts").select("*").eq("id", id).maybeSingle();
  return (data as PostRow | null) ?? null;
}

export async function adminSavePost(id: string | null, value: PostValue): Promise<void> {
  const db = supabaseAdmin();
  const { error } = id
    ? await db.from("posts").update({ ...value, updated_at: new Date().toISOString() }).eq("id", id)
    : await db.from("posts").insert(value);
  if (error) throw new Error(saveError(error.message));
}

export async function adminDeletePost(id: string): Promise<void> {
  const { error } = await supabaseAdmin().from("posts").delete().eq("id", id);
  if (error) throw new Error("Could not delete the post.");
}
```

- [ ] **Step 3: Make `uploadImage` take a folder**

In `src/lib/projects-admin.ts` change the signature and path:
```ts
export async function uploadImage(dir: string, file: File): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  ...
  const path = `${dir}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
```
In `src/app/admin/projects/actions.ts` replace both `uploadImage(parsed.value.slug, ...)` calls with `uploadImage(`projects/${parsed.value.slug}`, ...)`.

- [ ] **Step 4: Typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add src/lib/posts-db.ts src/lib/posts-admin.ts src/lib/projects-admin.ts src/app/admin/projects/actions.ts
git commit -m "Add the posts data layers"
```

---

### Task 5: Public blog from the database

**Files:**
- Modify: `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/[slug]/opengraph-image.tsx`, `src/app/blog/rss.xml/route.ts`, `src/app/sitemap.ts`
- Delete: `src/lib/blog.ts`, `content/blog/`
- Modify: `package.json` (remove `next-mdx-remote`, `gray-matter`)

- [ ] **Step 1: Blog list.** In `src/app/blog/page.tsx` import `getPosts` from `@/lib/posts-db`, make `Blog` `async`, use `const posts = await getPosts();`. Each row also shows the excerpt under the title when it is not empty.

- [ ] **Step 2: Post page.** `src/app/blog/[slug]/page.tsx`:

```tsx
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
```

- [ ] **Step 3: OG image, RSS and sitemap.** OG: `generateStaticParams` from `getPosts()`, `const post = await getPost(slug)`. RSS: `export async function GET()` with `const posts = await getPosts()` and an optional `<description>` from the excerpt, keep `dynamic = "force-static"`. Sitemap: `...(await getPosts()).map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date }))` and remove the `indexedPosts` import.

- [ ] **Step 4: Remove the old pipeline**

```bash
git rm src/lib/blog.ts content/blog/placeholder.mdx
npm uninstall next-mdx-remote gray-matter
```

- [ ] **Step 5: Verify and commit**

Run: `rm -rf .next && npx tsc --noEmit && npm run build`
Expected: no errors. `/blog` renders "No posts yet." and `/blog/rss.xml` returns an empty channel.

```bash
git add -A
git commit -m "Read the blog from Supabase and remove the MDX pipeline"
```

---

### Task 6: Admin list, editor and actions

**Files:**
- Create: `src/app/admin/blog/page.tsx`, `src/app/admin/blog/[id]/page.tsx`, `src/app/admin/blog/[id]/post-form.tsx`, `src/app/admin/blog/actions.ts`
- Modify: `src/app/admin/layout.tsx`

**Interfaces:**
- `savePost(prev: PostFormState, formData: FormData): Promise<PostFormState>` with `type PostFormState = { error?: string }`. Fields: `id`, `slug`, `title`, `excerpt`, `body`, `status`, `publishedAt`. On success it revalidates `/`, the blog paths and `/blog/rss.xml`, then redirects to `/admin/blog`.
- `deletePost(id: string)`.
- `uploadPostImage(formData: FormData): Promise<{ url?: string; error?: string }>` reads `file` and `slug` and returns the public URL.

- [ ] **Step 1: Actions** `src/app/admin/blog/actions.ts` with `"use server"`: each function starts with `await requireAdmin()`. `savePost` builds `PostFormFields` from the form, runs `parsePostForm`, calls `adminSavePost(id || null, value)` inside try and catch returning `{ error }`, then `revalidatePath("/", "layout")`, `revalidatePath("/blog/rss.xml")`, `redirect("/admin/blog")`. `deletePost` calls `adminDeletePost`, revalidates the same paths and redirects. `uploadPostImage` validates through `uploadImage(`posts/${slug || "drafts"}`, file)` and returns `{ url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${path}` }`.

- [ ] **Step 2: List page.** Rows with date, title, status, an Edit link. A "New post" button in the accent color. Same structure as the projects list.

- [ ] **Step 3: Editor page and form.** Server page loads the row (`new` or id) and renders `PostForm`. `PostForm` is a client component with `useActionState(savePost, {})`, submitting through `startTransition` so typed values survive an error. It has:
  - inputs for title, slug (hint: empty means built from the title), summary, status select, publish date input;
  - a two-column area on desktop: a Markdown `textarea` on the left, `<Markdown source={value} />` on the right (state `value`, stacked on phones);
  - an "Insert image" file input that calls `uploadPostImage` and inserts `![](url)` at the cursor position;
  - Save button and an error line with `role="alert"`;
  - on the editor page, a delete form with the "I understand" checkbox.

- [ ] **Step 4: Nav link.** In `src/app/admin/layout.tsx` add a `Blog` link after Projects.

- [ ] **Step 5: Typecheck, build and commit**

Run: `rm -rf .next && npx tsc --noEmit && npm run build`
Expected: no errors; build lists `/admin/blog` and `/admin/blog/[id]`.

```bash
git add src/app/admin
git commit -m "Add the blog list and editor"
```

---

### Task 7: Verification and merge

- [ ] **Step 1: Checks.** `npm test && npx tsc --noEmit && npm run build`. Expected: all pass.
- [ ] **Step 2: Merge and deploy.** `git checkout main && git merge feature/blog-cms && git push origin main`, then check the deployment status.
- [ ] **Step 3: Live test in the logged in browser.** Create a draft post (not visible on `/blog`), publish it (visible on `/blog`, `/blog/<slug>`, `/blog/rss.xml`, `/sitemap.xml`), check the Markdown renders (heading, list, code, link, image), set it back to draft (disappears), delete it.
- [ ] **Step 4: Lighthouse on `/blog` and a post page.** Expected: 95 or above.
