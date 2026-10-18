import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { projects } from "../src/lib/projects.ts";
import { cases } from "../src/lib/cases.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) throw new Error("Missing Supabase settings. Run with --env-file=.env.local");
const db = createClient(url, key, { auth: { persistSession: false } });

let position = 0;
for (const p of projects) {
  let preview_path: string | null = null;
  if (p.preview) {
    const path = `previews/${p.preview}`;
    const file = readFileSync(`public/previews/${p.preview}`);
    const up = await db.storage.from("images").upload(path, file, { contentType: "image/png", upsert: true });
    if (up.error) throw up.error;
    preview_path = path;
  }
  const c = cases.find((x) => x.slug === p.slug);
  const study = c
    ? { summary: c.summary, problem: c.problem, missing: c.missing, investigation: c.investigation, decision: c.decision, technical: c.technical, result: c.result }
    : null;
  const row = {
    slug: p.slug, name: p.name, year: p.year, one_liner: p.oneLiner, role: p.role,
    team: p.team ?? null, context: p.context ?? null, stack: p.stack,
    problem: p.problem, decision: p.decision, result: p.result,
    in_code: p.inCode, scale: p.scale,
    repo_kind: p.repo ? p.repo.kind : "none",
    repo_url: p.repo && p.repo.kind !== "private" ? p.repo.url : null,
    live_url: p.live ?? null, preview_path, result_images: [] as string[],
    internal: p.internal ?? false, study, position: position++, published: true,
  };
  const { error } = await db.from("projects").upsert(row, { onConflict: "slug" });
  if (error) throw error;
  console.log("seeded", p.slug);
}
const { count } = await db.from("projects").select("*", { count: "exact", head: true });
console.log("rows in projects:", count);
