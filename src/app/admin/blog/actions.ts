"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { parsePostForm } from "@/lib/post-mapper";
import { adminDeletePost, adminSavePost } from "@/lib/posts-admin";
import { uploadImage } from "@/lib/projects-admin";

export type PostFormState = { error?: string };

const text = (f: FormData, k: string) => String(f.get(k) ?? "");

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/blog/rss.xml");
}

export async function savePost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  await requireAdmin();
  const id = text(formData, "id") || null;
  const parsed = parsePostForm({
    slug: text(formData, "slug"),
    title: text(formData, "title"),
    excerpt: text(formData, "excerpt"),
    body: text(formData, "body"),
    status: text(formData, "status"),
    publishedAt: text(formData, "publishedAt"),
  });
  if (!parsed.ok) return { error: parsed.error };
  try {
    await adminSavePost(id, parsed.value);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save the post." };
  }
  refresh();
  redirect("/admin/blog");
}

export async function deletePost(id: string) {
  await requireAdmin();
  await adminDeletePost(id);
  refresh();
  redirect("/admin/blog");
}

// Used by the editor to insert an image into the Markdown body. Returns the public URL.
export async function uploadPostImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image." };
  const slug = text(formData, "slug").trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || "drafts";
  const up = await uploadImage(`posts/${slug}`, file);
  if (!up.ok) return { error: up.error };
  return { url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${up.path}` };
}
