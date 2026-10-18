import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ProjectInput, ProjectRow } from "@/lib/project-mapper";

const BUCKET = "images";
const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const MAX_BYTES = 5 * 1024 * 1024;

const saveError = (message: string) => (message.includes("duplicate") ? "That slug is already used." : "Could not save the project.");

export async function adminListProjects(): Promise<ProjectRow[]> {
  const { data, error } = await supabaseAdmin().from("projects").select("*").order("position", { ascending: true });
  if (error) throw new Error("Could not load projects");
  return data as ProjectRow[];
}

export async function adminGetProject(id: string): Promise<ProjectRow | null> {
  const { data } = await supabaseAdmin().from("projects").select("*").eq("id", id).maybeSingle();
  return (data as ProjectRow | null) ?? null;
}

export async function adminSave(id: string | null, value: ProjectInput, published: boolean): Promise<void> {
  const db = supabaseAdmin();
  if (id) {
    const { error } = await db.from("projects").update({ ...value, published, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw new Error(saveError(error.message));
    return;
  }
  const { data: last } = await db.from("projects").select("position").order("position", { ascending: false }).limit(1).maybeSingle();
  const position = ((last as { position: number } | null)?.position ?? -1) + 1;
  const { error } = await db.from("projects").insert({ ...value, published, position });
  if (error) throw new Error(saveError(error.message));
}

export async function adminDelete(id: string): Promise<void> {
  const row = await adminGetProject(id);
  const { error } = await supabaseAdmin().from("projects").delete().eq("id", id);
  if (error) throw new Error("Could not delete the project.");
  if (row) await removeImages([...(row.preview_path ? [row.preview_path] : []), ...row.result_images]);
}

export async function adminMove(id: string, dir: "up" | "down"): Promise<void> {
  const rows = await adminListProjects();
  const i = rows.findIndex((r) => r.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= rows.length) return;
  // Positions are rewritten from the array order so duplicates cannot occur.
  const reordered = [...rows];
  [reordered[i], reordered[j]] = [reordered[j], reordered[i]];
  const db = supabaseAdmin();
  for (const [index, r] of reordered.entries()) {
    if (r.position !== index) {
      const { error } = await db.from("projects").update({ position: index }).eq("id", r.id);
      if (error) throw new Error("Could not reorder.");
    }
  }
}

export async function adminSetPublished(id: string, published: boolean): Promise<void> {
  const { error } = await supabaseAdmin().from("projects").update({ published, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error("Could not update the project.");
}

export async function uploadImage(dir: string, file: File): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const ext = TYPES[file.type];
  if (!ext) return { ok: false, error: "Images must be png, jpeg or webp." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Each image must be 5 MB or smaller." };
  const path = `${dir}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabaseAdmin().storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) return { ok: false, error: "Could not upload an image." };
  return { ok: true, path };
}

export async function removeImages(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  await supabaseAdmin().storage.from(BUCKET).remove(paths);
}
