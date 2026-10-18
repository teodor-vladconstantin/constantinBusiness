"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { Markdown } from "@/components/markdown";
import type { PostRow } from "@/lib/post-mapper";
import { savePost, uploadPostImage, type PostFormState } from "../actions";

const box = "w-full border border-line bg-transparent px-2 py-1 text-[16px] text-fg outline-none focus:border-fg";
const initial: PostFormState = {};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="text-[13px] text-muted">{hint}</span>}
    </label>
  );
}

export function PostForm({ row }: { row: PostRow | null }) {
  const [state, action, pending] = useActionState(savePost, initial);
  const [body, setBody] = useState(row?.body_md ?? "");
  const [slug, setSlug] = useState(row?.slug ?? "");
  const [imageMessage, setImageMessage] = useState("");
  const area = useRef<HTMLTextAreaElement>(null);

  async function insertImage(file: File) {
    setImageMessage("Uploading");
    const data = new FormData();
    data.set("file", file);
    data.set("slug", slug);
    const res = await uploadPostImage(data);
    if (!res.url) {
      setImageMessage(res.error ?? "Could not upload the image.");
      return;
    }
    const at = area.current?.selectionStart ?? body.length;
    const snippet = `![](${res.url})`;
    setBody(body.slice(0, at) + snippet + body.slice(at));
    setImageMessage("Image added. Write a short description between the square brackets.");
  }

  return (
    <form
      // Submitting through startTransition keeps the typed values when an error comes back.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="grid gap-3"
    >
      <input type="hidden" name="id" defaultValue={row?.id ?? ""} />
      <div className="grid max-w-[720px] gap-3">
        <Field label="Title">
          <input name="title" required maxLength={150} defaultValue={row?.title} className={box} />
        </Field>
        <Field label="Slug" hint="Empty means it is built from the title. It is the page address.">
          <input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className={box} />
        </Field>
        <Field label="Summary" hint="Up to 300 characters. Shown in the blog list and in search results.">
          <textarea name="excerpt" rows={3} maxLength={300} defaultValue={row?.excerpt} className={box} />
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Status">
            <select name="status" defaultValue={row?.status ?? "draft"} className={box}>
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <Field label="Publish date" hint="YYYY-MM-DD. Empty means today.">
            <input name="publishedAt" defaultValue={row?.published_at?.slice(0, 10) ?? ""} placeholder="2026-10-18" className={box} />
          </Field>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid content-start gap-1">
          <span className="label">Body (Markdown)</span>
          <textarea ref={area} name="body" value={body} onChange={(e) => setBody(e.target.value)} rows={24} className={`${box} font-mono text-[14px]`} />
          <label className="grid gap-1">
            <span className="label">Insert an image</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void insertImage(f);
                e.target.value = "";
              }}
              className={box}
            />
          </label>
          {imageMessage && <span className="text-[13px] text-muted">{imageMessage}</span>}
        </div>
        <div className="grid content-start gap-1">
          <span className="label">Preview</span>
          <div className="prose-site min-h-[200px] border border-line p-2">{body.trim() ? <Markdown source={body} /> : <p className="text-muted">Nothing to preview yet.</p>}</div>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-[15px]">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="justify-self-start bg-accent px-3 py-1 font-mono text-[12px] uppercase tracking-[0.08em] text-black disabled:opacity-50">
        {pending ? "Saving" : "Save post"}
      </button>
    </form>
  );
}
