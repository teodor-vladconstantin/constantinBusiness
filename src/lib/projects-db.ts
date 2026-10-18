import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Project } from "@/lib/projects";
import { projectFromRow, type ProjectRow } from "@/lib/project-mapper";

const imageBase = () => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/`;

// Anon client. Row level security lets it read published projects only.
const client = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await client().from("projects").select("*").eq("published", true).order("position", { ascending: true });
  if (error) throw new Error("Could not load projects");
  return (data as ProjectRow[]).map((r) => projectFromRow(r, imageBase()));
}

export async function getProject(slug: string): Promise<Project | null> {
  const { data, error } = await client().from("projects").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  if (error) throw new Error("Could not load the project");
  return data ? projectFromRow(data as ProjectRow, imageBase()) : null;
}
