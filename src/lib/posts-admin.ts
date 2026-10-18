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
