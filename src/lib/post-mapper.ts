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
