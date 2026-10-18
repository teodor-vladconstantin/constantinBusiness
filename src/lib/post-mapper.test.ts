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
