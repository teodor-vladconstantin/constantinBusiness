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
