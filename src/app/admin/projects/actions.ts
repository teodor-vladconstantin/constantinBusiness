"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { parseProjectForm, type ProjectFormFields } from "@/lib/project-mapper";
import { adminDelete, adminGetProject, adminMove, adminSave, adminSetPublished, removeImages, uploadImage } from "@/lib/projects-admin";

export type ProjectFormState = { error?: string };

const FIELDS = [
  "slug", "name", "year", "oneLiner", "role", "team", "context", "stack", "problem", "decision", "result", "inCode", "scale",
  "repoKind", "repoUrl", "liveUrl", "internal", "study", "studySummary", "studyProblem", "studyMissing", "studyInvestigation",
  "studyDecision", "studyTechnical", "studyResult",
] as const;

const text = (f: FormData, k: string) => String(f.get(k) ?? "");
const refresh = () => {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
};

export async function saveProject(_prev: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  await requireAdmin();
  const id = text(formData, "id") || null;

  const fields = Object.fromEntries(FIELDS.map((k) => [k, text(formData, k)])) as ProjectFormFields;
  const parsed = parseProjectForm(fields);
  if (!parsed.ok) return { error: parsed.error };

  const existing = id ? await adminGetProject(id) : null;
  if (id && !existing) return { error: "That project no longer exists." };

  // Preview: keep, replace or remove.
  let previewPath = existing?.preview_path ?? null;
  const removed: string[] = [];
  const previewFile = formData.get("previewFile");
  if (previewFile instanceof File && previewFile.size > 0) {
    const up = await uploadImage(`projects/${parsed.value.slug}`, previewFile);
    if (!up.ok) return { error: up.error };
    if (previewPath) removed.push(previewPath);
    previewPath = up.path;
  } else if (formData.get("removePreview") === "on" && previewPath) {
    removed.push(previewPath);
    previewPath = null;
  }

  // Result screenshots: drop the ticked ones, then add new uploads.
  const drop = new Set(formData.getAll("removeResult").map(String));
  let resultImages = (existing?.result_images ?? []).filter((p) => !drop.has(p));
  for (const p of existing?.result_images ?? []) if (drop.has(p)) removed.push(p);
  for (const f of formData.getAll("resultFiles")) {
    if (f instanceof File && f.size > 0) {
      const up = await uploadImage(`projects/${parsed.value.slug}`, f);
      if (!up.ok) return { error: up.error };
      resultImages = [...resultImages, up.path];
    }
  }

  try {
    await adminSave(id, { ...parsed.value, preview_path: previewPath, result_images: resultImages }, formData.get("published") === "on");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save the project." };
  }
  await removeImages(removed);
  refresh();
  redirect("/admin/projects");
}

export async function deleteProject(id: string) {
  await requireAdmin();
  await adminDelete(id);
  refresh();
  redirect("/admin/projects");
}

export async function moveProject(id: string, dir: "up" | "down") {
  await requireAdmin();
  await adminMove(id, dir);
  refresh();
  revalidatePath("/admin/projects");
}

export async function setPublished(id: string, published: boolean) {
  await requireAdmin();
  await adminSetPublished(id, published);
  refresh();
  revalidatePath("/admin/projects");
}
