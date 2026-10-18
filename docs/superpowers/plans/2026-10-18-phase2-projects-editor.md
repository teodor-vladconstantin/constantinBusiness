# Phase 2: Projects editor. Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The owner adds, edits, orders, hides and deletes projects, including case study sections and screenshots, from `/admin/projects`. The public site reads projects from Supabase.

**Architecture:** A `projects` table (public read of published rows through RLS) and a public Storage bucket `images`. Pure functions in `src/lib/project-mapper.ts` convert between database rows, form text and the existing `Project` type, and carry the tests. Public pages become async server components that read through an anon client and stay static. Every admin write uses the service role client behind `requireAdmin()` and ends with `revalidatePath("/", "layout")`.

**Tech Stack:** Next.js 16.4.1, React 19, TypeScript, Tailwind 4, `@supabase/supabase-js` 2.118.0, Vitest 5.0.5, Node 24 type stripping for the seed script.

## Global Constraints

- Style: dark, Swiss, bg #111113, text #F4F4F5, secondary #A1A1AA, hairlines #2A2A2E, accent #EAB308, one accent per screen, no gradients, glow, blur or shadows, radius 0 to 2px.
- Copy: short sentences, no em dashes, no negation-then-positive structure.
- Commits: no `Co-Authored-By` trailer. Work on branch `feature/projects-cms`, merge to `main` only after the seed ran and the build passes.
- Never open `.env*` files. The seed runs with `node --env-file=.env.local`, so values stay out of the transcript.
- Service role key stays in server-only code. Admin pages and actions call `requireAdmin()` first.
- Images: png, jpeg or webp, at most 5 MB each, stored under `projects/<slug>/` in the `images` bucket.
- A Supabase failure at build time fails the build. Pages never fall back to stale code data.
- Next 16: `cookies()`, `headers()` and `params` are async. Server Functions live in `"use server"` files.

## File Structure

| File | Responsibility |
|---|---|
| `supabase/migrations/0002_projects.sql` | `projects` table, RLS policy, `images` bucket |
| `src/lib/projects.ts` | Types and `liveHost` only (data removed in Task 4) |
| `src/lib/project-mapper.ts` | `projectFromRow`, `parseProjectForm`, text parsers (pure, tested) |
| `src/lib/project-mapper.test.ts` | Tests for the mapper and the parsers |
| `src/lib/projects-db.ts` | Public reads: `getProjects`, `getProject` |
| `src/lib/projects-admin.ts` | Admin reads and writes with the service role, image upload |
| `scripts/seed-projects.mts` | One-time seed from the code data (deleted in Task 4) |
| `src/app/admin/projects/page.tsx` | List, order, hide or show |
| `src/app/admin/projects/[id]/page.tsx` | Editor page (`new` or an id) |
| `src/app/admin/projects/[id]/project-form.tsx` | Client form |
| `src/app/admin/projects/actions.ts` | `saveProject`, `deleteProject`, `moveProject`, `setPublished` |
| `src/app/page.tsx`, `src/app/work/page.tsx`, `src/app/work/[slug]/page.tsx`, `src/app/work/[slug]/opengraph-image.tsx`, `src/app/sitemap.ts`, `src/components/work-card.tsx` | Read from the database |
| `next.config.ts` | Remote image host, Server Action body limit |

---

### Task 1: Table, policy and bucket

**Files:**
- Create: `supabase/migrations/0002_projects.sql`

**Interfaces:**
- Produces: table `public.projects` with columns `id, slug, name, year, one_liner, role, team, context, stack, problem, decision, result, in_code, scale, repo_kind, repo_url, live_url, preview_path, result_images, internal, study, position, published, updated_at`; public bucket `images`.

- [ ] **Step 1: Create the migration file**

```sql
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  year text not null,
  one_liner text not null,
  role text not null,
  team text,
  context text,
  stack text[] not null default '{}',
  problem text not null default '',
  decision text not null default '',
  result text not null default '',
  in_code jsonb not null default '[]',
  scale text[] not null default '{}',
  repo_kind text not null default 'none' check (repo_kind in ('none', 'public', 'team', 'private')),
  repo_url text,
  live_url text,
  preview_path text,
  result_images text[] not null default '{}',
  internal boolean not null default false,
  study jsonb,
  position int not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "public reads published projects" on public.projects
  for select using (published = true);

insert into storage.buckets (id, name, public) values ('images', 'images', true)
  on conflict (id) do nothing;
-- Uploads and deletes use the service role key on the server. No write policies exist on purpose.
```

- [ ] **Step 2: Run it in Supabase**

Open the SQL editor of the project, paste the file as a single statement block and run. Expected: "Success. No rows returned".

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0002_projects.sql
git commit -m "Add the projects table and the images bucket"
```

---

### Task 2: Types and the pure mapper (TDD)

**Files:**
- Modify: `src/lib/projects.ts` (types first, data stays until Task 4)
- Create: `src/lib/project-mapper.ts`
- Test: `src/lib/project-mapper.test.ts`

**Interfaces:**
- Produces in `src/lib/projects.ts`: `type StudySections = { summary?: string[]; problem: string[]; missing: string[]; investigation: string[]; decision: string[]; technical?: string[]; result: string[] }`; `Project` gains `resultImages: string[]`, `study?: StudySections` and its `preview` becomes a full image URL.
- Produces in `src/lib/project-mapper.ts`:
  - `type ProjectRow` (snake_case columns from Task 1)
  - `type ProjectInput = Omit<ProjectRow, "id" | "position" | "published" | "updated_at">`
  - `projectFromRow(row: ProjectRow, imageBase: string): Project`
  - `type ProjectFormFields` (all strings, listed in Step 3)
  - `parseProjectForm(f: ProjectFormFields): { ok: true; value: Omit<ProjectInput, "preview_path" | "result_images"> } | { ok: false; error: string }`
  - `lines(s: string): string[]`, `paragraphs(s: string): string[]`, `csv(s: string): string[]`

- [ ] **Step 1: Update the types in `src/lib/projects.ts`**

Replace the `Project` type (keep `RepoLink`) with:

```ts
export type StudySections = {
  summary?: string[];
  problem: string[];
  missing: string[];
  investigation: string[];
  decision: string[];
  technical?: string[];
  result: string[];
};

export type Project = {
  slug: string;
  name: string;
  year: string;
  oneLiner: string;
  role: string;
  team?: string;
  context?: string;
  stack: string[];
  problem: string;
  decision: string;
  result: string;
  inCode: { text: string; path: string }[];
  scale: string[];
  repo?: RepoLink;
  live?: string;
  preview?: string; // full image URL
  resultImages?: string[]; // full image URLs
  internal?: boolean;
  study?: StudySections;
};
```
The data array still lists `preview: "joben.png"` and `case: true`. Until Task 4, those entries fail to typecheck. Keep the data compiling by leaving the old `Project` type under the name `LegacyProject` for the array only:

```ts
type LegacyProject = Omit<Project, "preview" | "resultImages" | "study"> & { preview?: string; previewSmall?: boolean; case?: boolean };
export const projects: LegacyProject[] = [
```
and change `export const getProject = (slug: string) => projects.find((p) => p.slug === slug);` to remain typed against `LegacyProject`. Pages still import this until Task 4.

- [ ] **Step 2: Write the failing test** `src/lib/project-mapper.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { csv, lines, paragraphs, parseProjectForm, projectFromRow, type ProjectFormFields, type ProjectRow } from "@/lib/project-mapper";

const base = "https://x.supabase.co/storage/v1/object/public/images/";

const row: ProjectRow = {
  id: "1", slug: "joben", name: "Joben", year: "2026", one_liner: "Resume builder.", role: "Author.", team: null, context: null,
  stack: ["Next.js"], problem: "p", decision: "d", result: "r", in_code: [{ text: "t", path: "a.ts" }], scale: ["421 commits"],
  repo_kind: "public", repo_url: "https://github.com/a/b", live_url: "https://joben.eu", preview_path: "previews/joben.png",
  result_images: ["projects/joben/r1.png"], internal: false, study: null, position: 0, published: true, updated_at: "2026-10-18",
};

const form: ProjectFormFields = {
  slug: "my-app", name: "My app", year: "2026", oneLiner: "One line.", role: "Built it.", team: "", context: "",
  stack: "Next.js, Supabase", problem: "P", decision: "D", result: "R", inCode: "Rules are pure | src/rules.ts\nNo path line",
  scale: "3 migrations\n10 tests", repoKind: "public", repoUrl: "https://github.com/a/b", liveUrl: "https://example.com",
  internal: "", study: "", studySummary: "", studyProblem: "", studyMissing: "", studyInvestigation: "", studyDecision: "",
  studyTechnical: "", studyResult: "",
};

describe("parsers", () => {
  it("lines trims and drops empty lines", () => {
    expect(lines(" a \n\n b\r\n")).toEqual(["a", "b"]);
  });
  it("paragraphs splits on blank lines", () => {
    expect(paragraphs("one\ntwo\n\nthree")).toEqual(["one\ntwo", "three"]);
  });
  it("csv splits on commas and trims", () => {
    expect(csv("a, b ,,c")).toEqual(["a", "b", "c"]);
  });
});

describe("projectFromRow", () => {
  it("maps a public repo, live url and images", () => {
    const p = projectFromRow(row, base);
    expect(p.oneLiner).toBe("Resume builder.");
    expect(p.repo).toEqual({ kind: "public", url: "https://github.com/a/b", label: "Repository" });
    expect(p.live).toBe("https://joben.eu");
    expect(p.preview).toBe(base + "previews/joben.png");
    expect(p.resultImages).toEqual([base + "projects/joben/r1.png"]);
    expect(p.study).toBeUndefined();
  });
  it("maps team and private repos with fixed labels", () => {
    expect(projectFromRow({ ...row, repo_kind: "team" }, base).repo).toEqual({ kind: "team", url: "https://github.com/a/b", label: "Team repository" });
    expect(projectFromRow({ ...row, repo_kind: "private", repo_url: null }, base).repo).toEqual({ kind: "private", label: "Private repository" });
  });
  it("omits the repo when the kind is none", () => {
    expect(projectFromRow({ ...row, repo_kind: "none", repo_url: null }, base).repo).toBeUndefined();
  });
  it("passes the study through", () => {
    const study = { problem: ["a"], missing: ["b"], investigation: ["c"], decision: ["d"], result: ["e"] };
    expect(projectFromRow({ ...row, study }, base).study).toEqual(study);
  });
});

describe("parseProjectForm", () => {
  it("parses a valid form", () => {
    const r = parseProjectForm(form);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.slug).toBe("my-app");
    expect(r.value.stack).toEqual(["Next.js", "Supabase"]);
    expect(r.value.scale).toEqual(["3 migrations", "10 tests"]);
    expect(r.value.in_code).toEqual([{ text: "Rules are pure", path: "src/rules.ts" }, { text: "No path line", path: "" }]);
    expect(r.value.repo_kind).toBe("public");
    expect(r.value.team).toBeNull();
    expect(r.value.study).toBeNull();
    expect(r.value.internal).toBe(false);
  });
  it("rejects a bad slug", () => {
    expect(parseProjectForm({ ...form, slug: "My App" }).ok).toBe(false);
  });
  it("rejects a missing name", () => {
    expect(parseProjectForm({ ...form, name: " " }).ok).toBe(false);
  });
  it("requires an https url for a public repo", () => {
    expect(parseProjectForm({ ...form, repoUrl: "" }).ok).toBe(false);
    expect(parseProjectForm({ ...form, repoUrl: "http://github.com/a/b" }).ok).toBe(false);
  });
  it("ignores the repo url when the kind is private or none", () => {
    const r = parseProjectForm({ ...form, repoKind: "private", repoUrl: "" });
    expect(r.ok && r.value.repo_url).toBe(null);
  });
  it("rejects a live url that is not https", () => {
    expect(parseProjectForm({ ...form, liveUrl: "javascript:alert(1)" }).ok).toBe(false);
  });
  it("builds a study when the case study box is checked", () => {
    const r = parseProjectForm({ ...form, study: "on", studyProblem: "A\n\nB", studyMissing: "M", studyInvestigation: "I", studyDecision: "D", studyResult: "R", studySummary: "S1\n\nS2", studyTechnical: "T" });
    expect(r.ok && r.value.study).toEqual({ summary: ["S1", "S2"], problem: ["A", "B"], missing: ["M"], investigation: ["I"], decision: ["D"], technical: ["T"], result: ["R"] });
  });
  it("omits empty optional study parts", () => {
    const r = parseProjectForm({ ...form, study: "on", studyProblem: "A", studyMissing: "M", studyInvestigation: "I", studyDecision: "D", studyResult: "R" });
    expect(r.ok && r.value.study).toEqual({ problem: ["A"], missing: ["M"], investigation: ["I"], decision: ["D"], result: ["R"] });
  });
  it("rejects a checked case study with an empty required part", () => {
    expect(parseProjectForm({ ...form, study: "on", studyProblem: "A" }).ok).toBe(false);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run src/lib/project-mapper.test.ts`
Expected: FAIL, "Failed to resolve import @/lib/project-mapper".

- [ ] **Step 4: Implement** `src/lib/project-mapper.ts`

```ts
import type { Project, RepoLink, StudySections } from "@/lib/projects";

export type ProjectRow = {
  id: string;
  slug: string;
  name: string;
  year: string;
  one_liner: string;
  role: string;
  team: string | null;
  context: string | null;
  stack: string[];
  problem: string;
  decision: string;
  result: string;
  in_code: { text: string; path: string }[];
  scale: string[];
  repo_kind: "none" | "public" | "team" | "private";
  repo_url: string | null;
  live_url: string | null;
  preview_path: string | null;
  result_images: string[];
  internal: boolean;
  study: StudySections | null;
  position: number;
  published: boolean;
  updated_at: string;
};

export type ProjectInput = Omit<ProjectRow, "id" | "position" | "published" | "updated_at">;

export const lines = (s: string): string[] =>
  s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

export const paragraphs = (s: string): string[] =>
  s.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export const csv = (s: string): string[] =>
  s.split(",").map((x) => x.trim()).filter(Boolean);

export function projectFromRow(r: ProjectRow, imageBase: string): Project {
  const repo: RepoLink | undefined =
    r.repo_kind === "public" && r.repo_url
      ? { kind: "public", url: r.repo_url, label: "Repository" }
      : r.repo_kind === "team" && r.repo_url
        ? { kind: "team", url: r.repo_url, label: "Team repository" }
        : r.repo_kind === "private"
          ? { kind: "private", label: "Private repository" }
          : undefined;
  return {
    slug: r.slug,
    name: r.name,
    year: r.year,
    oneLiner: r.one_liner,
    role: r.role,
    team: r.team ?? undefined,
    context: r.context ?? undefined,
    stack: r.stack,
    problem: r.problem,
    decision: r.decision,
    result: r.result,
    inCode: r.in_code,
    scale: r.scale,
    repo,
    live: r.live_url ?? undefined,
    preview: r.preview_path ? imageBase + r.preview_path : undefined,
    resultImages: r.result_images.map((p) => imageBase + p),
    internal: r.internal || undefined,
    study: r.study ?? undefined,
  };
}

export type ProjectFormFields = {
  slug: string; name: string; year: string; oneLiner: string; role: string; team: string; context: string;
  stack: string; problem: string; decision: string; result: string; inCode: string; scale: string;
  repoKind: string; repoUrl: string; liveUrl: string; internal: string; study: string;
  studySummary: string; studyProblem: string; studyMissing: string; studyInvestigation: string;
  studyDecision: string; studyTechnical: string; studyResult: string;
};

export type FormResult = { ok: true; value: Omit<ProjectInput, "preview_path" | "result_images"> } | { ok: false; error: string };

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const KINDS = ["none", "public", "team", "private"] as const;
const https = (u: string) => /^https:\/\/[^\s]+$/.test(u);

export function parseProjectForm(f: ProjectFormFields): FormResult {
  const slug = f.slug.trim();
  const name = f.name.trim();
  const year = f.year.trim();
  const oneLiner = f.oneLiner.trim();
  const role = f.role.trim();
  if (!SLUG.test(slug)) return { ok: false, error: "Slug uses lowercase letters, digits and hyphens." };
  if (!name || !year || !oneLiner || !role) return { ok: false, error: "Name, year, one line and role are required." };

  const kind = (KINDS as readonly string[]).includes(f.repoKind) ? (f.repoKind as (typeof KINDS)[number]) : "none";
  const repoUrl = f.repoUrl.trim();
  if ((kind === "public" || kind === "team") && !https(repoUrl)) return { ok: false, error: "A public or team repository needs an https link." };
  const liveUrl = f.liveUrl.trim();
  if (liveUrl && !https(liveUrl)) return { ok: false, error: "The live link must start with https://." };

  const in_code = lines(f.inCode).map((l) => {
    const [text, ...rest] = l.split("|");
    return { text: text.trim(), path: rest.join("|").trim() };
  });

  let study: StudySections | null = null;
  if (f.study === "on") {
    const problem = paragraphs(f.studyProblem);
    const missing = paragraphs(f.studyMissing);
    const investigation = paragraphs(f.studyInvestigation);
    const decision = paragraphs(f.studyDecision);
    const result = paragraphs(f.studyResult);
    if (!problem.length || !missing.length || !investigation.length || !decision.length || !result.length) {
      return { ok: false, error: "A case study needs text in Problem, Missing, Investigation, Built and Result." };
    }
    study = { problem, missing, investigation, decision, result };
    const summary = paragraphs(f.studySummary);
    const technical = paragraphs(f.studyTechnical);
    if (summary.length) study = { summary, ...study };
    if (technical.length) study = { ...study, technical };
  }

  return {
    ok: true,
    value: {
      slug, name, year, one_liner: oneLiner, role,
      team: f.team.trim() || null,
      context: f.context.trim() || null,
      stack: csv(f.stack),
      problem: f.problem.trim(),
      decision: f.decision.trim(),
      result: f.result.trim(),
      in_code,
      scale: lines(f.scale),
      repo_kind: kind,
      repo_url: kind === "public" || kind === "team" ? repoUrl : null,
      live_url: liveUrl || null,
      internal: f.internal === "on",
      study,
    },
  };
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run`
Expected: all tests pass (19 existing plus the new ones).

- [ ] **Step 6: Typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add src/lib/projects.ts src/lib/project-mapper.ts src/lib/project-mapper.test.ts
git commit -m "Add the project mapper with tests"
```

---

### Task 3: Seed script and first run

**Files:**
- Create: `scripts/seed-projects.mts`

**Interfaces:**
- Consumes: `projects` from `src/lib/projects.ts` and `cases` from `src/lib/cases.ts` (still in code at this point).
- Produces: rows in `projects` and files under `previews/` in the `images` bucket.

- [ ] **Step 1: Create `scripts/seed-projects.mts`**

```ts
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
```
Rows with `study: null` for the five projects without a case study. The `summary` and `technical` keys are `undefined` for Joben (no summary) and are dropped by JSON serialization.

- [ ] **Step 2: Run the seed**

Run: `node --env-file=.env.local scripts/seed-projects.mts`
Expected: seven "seeded <slug>" lines and "rows in projects: 7". If Node rejects the `.ts` import, run with `node --experimental-strip-types --env-file=.env.local scripts/seed-projects.mts`.

- [ ] **Step 3: Verify in Supabase**

Open Table Editor, table `projects`: seven rows, `joben` and `nyra` have a non-null `study`. Storage, bucket `images`, folder `previews`: the png files exist.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-projects.mts
git commit -m "Add the one-time projects seed script"
```

---

### Task 4: Public pages read from the database

**Files:**
- Create: `src/lib/projects-db.ts`
- Modify: `src/lib/projects.ts`, `src/app/page.tsx`, `src/app/work/page.tsx`, `src/app/work/[slug]/page.tsx`, `src/app/work/[slug]/opengraph-image.tsx`, `src/app/sitemap.ts`, `src/components/work-card.tsx`, `next.config.ts`
- Delete: `src/lib/cases.ts`, `scripts/seed-projects.mts`, `public/previews/*` (files now live in the bucket)

**Interfaces:**
- Consumes: `projectFromRow`, `ProjectRow` (Task 2).
- Produces: `getProjects(): Promise<Project[]>` (published, ordered by `position`), `getProject(slug: string): Promise<Project | null>`.

- [ ] **Step 1: Create `src/lib/projects-db.ts`**

```ts
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
```

- [ ] **Step 2: Reduce `src/lib/projects.ts` to types and helpers**

Delete the `LegacyProject` type, the `priv` constant, the `projects` array and the old `getProject`. Keep `RepoLink`, `StudySections`, `Project` and `liveHost`:

```ts
// Host shown as the link text, for example "joben.eu".
export const liveHost = (url: string) => new URL(url).host.replace(/^www\./, "");
```

- [ ] **Step 3: Home, `src/app/page.tsx`**

Make the component `async`, replace the data lines and remove the `getProject, projects` import:

```tsx
import { getProjects } from "@/lib/projects-db";
...
export default async function Home() {
  const all = await getProjects();
  const featured = all.filter((p) => p.study).slice(0, 2);
  const others = all.filter((p) => !featured.includes(p));
```
The rest of the JSX is unchanged (`featured.map`, `others.map`).

- [ ] **Step 4: Work, `src/app/work/page.tsx`**

Make the component `async`, import `getProjects` from `@/lib/projects-db`, keep `liveHost` from `@/lib/projects`, and use:

```tsx
export default async function Work() {
  const projects = await getProjects();
  const cases = projects.filter((p) => p.study);
  const others = projects.filter((p) => !p.study);
```

- [ ] **Step 5: Project page, `src/app/work/[slug]/page.tsx`**

Apply these changes:
- Remove the `fs`, `path` imports, the `getCase` import and `export const dynamicParams = false;`.
- Imports: `import { getProject, getProjects } from "@/lib/projects-db";` and `import { liveHost } from "@/lib/projects";`.
- `generateStaticParams`: `return (await getProjects()).map((p) => ({ slug: p.slug }));` (make it `async`).
- `generateMetadata`: `const p = await getProject(slug);` and title `` `${p?.name ?? "Project"}${p?.study ? " case study" : ""}` ``.
- In the component: `const project = await getProject(slug); if (!project) notFound(); const study = project.study; const resultImages = project.resultImages ?? [];` (delete the `readdirSync` line).
- Result images already render from `b.images`; the `Image` `src` there changes from `` `/previews/${n}` `` to `n` (now a full URL).
- The hero preview `Image` `src` changes from `` `/previews/${project.preview}` `` to `project.preview`.

- [ ] **Step 6: OG image and sitemap**

`src/app/work/[slug]/opengraph-image.tsx`:
```tsx
import { ogSize, renderOg } from "@/lib/og";
import { getProject, getProjects } from "@/lib/projects-db";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Project";

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProject(slug);
  return renderOg({ label: `Project ${p?.year ?? ""}`.trim(), title: p?.name ?? "Project" });
}
```
`src/app/sitemap.ts`: make `sitemap` `async`, `const projects = await getProjects();` with the import from `@/lib/projects-db`.

- [ ] **Step 7: WorkCard**

In `src/components/work-card.tsx` change the `Image` `src` from `` `/previews/${p.preview}` `` to `p.preview`.

- [ ] **Step 8: `next.config.ts`**

```ts
import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : undefined;

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/images/**" }] : [],
  },
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
};

export default config;
```

- [ ] **Step 9: Remove the old data, then build**

```bash
git rm src/lib/cases.ts scripts/seed-projects.mts
git rm -r public/previews
```
Run: `rm -rf .next && npx tsc --noEmit && npm test && npm run build`
Expected: no type errors, tests pass, build lists `/work/[slug]` with seven params and `/` static. Open `npm run start`: Home, `/work`, `/work/joben` look identical to before (screenshots from Supabase).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Read projects from Supabase and remove the code data"
```

---

### Task 5: Admin data layer and actions

**Files:**
- Create: `src/lib/projects-admin.ts`, `src/app/admin/projects/actions.ts`

**Interfaces:**
- Consumes: `supabaseAdmin` (phase 1), `requireAdmin` (phase 1), `parseProjectForm`, `ProjectFormFields`, `ProjectRow` (Task 2).
- Produces:
  - `adminListProjects(): Promise<ProjectRow[]>` (all rows, ordered by position)
  - `adminGetProject(id: string): Promise<ProjectRow | null>`
  - `adminSave(id: string | null, value: ProjectInput, published: boolean): Promise<void>`
  - `adminDelete(id: string): Promise<void>`
  - `adminMove(id: string, dir: "up" | "down"): Promise<void>`
  - `adminSetPublished(id: string, published: boolean): Promise<void>`
  - `uploadImage(slug: string, file: File): Promise<{ ok: true; path: string } | { ok: false; error: string }>`
  - `removeImages(paths: string[]): Promise<void>`
  - Server actions `saveProject(prev: ProjectFormState, formData: FormData): Promise<ProjectFormState>` with `type ProjectFormState = { error?: string }`, `deleteProject(id: string)`, `moveProject(id: string, dir: "up" | "down")`, `setPublished(id: string, published: boolean)`.

- [ ] **Step 1: Create `src/lib/projects-admin.ts`**

```ts
import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ProjectInput, ProjectRow } from "@/lib/project-mapper";

const BUCKET = "images";
const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const MAX_BYTES = 5 * 1024 * 1024;

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
    if (error) throw new Error(error.message.includes("duplicate") ? "That slug is already used." : "Could not save the project.");
    return;
  }
  const { data: last } = await db.from("projects").select("position").order("position", { ascending: false }).limit(1).maybeSingle();
  const position = ((last as { position: number } | null)?.position ?? -1) + 1;
  const { error } = await db.from("projects").insert({ ...value, published, position });
  if (error) throw new Error(error.message.includes("duplicate") ? "That slug is already used." : "Could not save the project.");
}

export async function adminDelete(id: string): Promise<void> {
  const db = supabaseAdmin();
  const row = await adminGetProject(id);
  const { error } = await db.from("projects").delete().eq("id", id);
  if (error) throw new Error("Could not delete the project.");
  if (row) await removeImages([...(row.preview_path ? [row.preview_path] : []), ...row.result_images]);
}

export async function adminMove(id: string, dir: "up" | "down"): Promise<void> {
  const rows = await adminListProjects();
  const i = rows.findIndex((r) => r.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= rows.length) return;
  const db = supabaseAdmin();
  const a = rows[i];
  const b = rows[j];
  // Positions are rewritten from the array order so duplicates cannot occur.
  const reordered = [...rows];
  reordered[i] = b;
  reordered[j] = a;
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

export async function uploadImage(slug: string, file: File): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const ext = TYPES[file.type];
  if (!ext) return { ok: false, error: "Images must be png, jpeg or webp." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Each image must be 5 MB or smaller." };
  const path = `projects/${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabaseAdmin().storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) return { ok: false, error: "Could not upload an image." };
  return { ok: true, path };
}

export async function removeImages(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  await supabaseAdmin().storage.from(BUCKET).remove(paths);
}
```

- [ ] **Step 2: Create `src/app/admin/projects/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { parseProjectForm, type ProjectFormFields } from "@/lib/project-mapper";
import { adminDelete, adminGetProject, adminMove, adminSave, adminSetPublished, removeImages, uploadImage } from "@/lib/projects-admin";

export type ProjectFormState = { error?: string };

const text = (f: FormData, k: string) => String(f.get(k) ?? "");
const refresh = () => revalidatePath("/", "layout");

export async function saveProject(_prev: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  await requireAdmin();
  const id = text(formData, "id") || null;

  const fields = Object.fromEntries(
    ["slug", "name", "year", "oneLiner", "role", "team", "context", "stack", "problem", "decision", "result", "inCode", "scale", "repoKind", "repoUrl", "liveUrl", "internal", "study", "studySummary", "studyProblem", "studyMissing", "studyInvestigation", "studyDecision", "studyTechnical", "studyResult"].map((k) => [k, text(formData, k)]),
  ) as ProjectFormFields;
  const parsed = parseProjectForm(fields);
  if (!parsed.ok) return { error: parsed.error };

  const existing = id ? await adminGetProject(id) : null;
  if (id && !existing) return { error: "That project no longer exists." };

  // Preview: keep, replace or remove.
  let previewPath = existing?.preview_path ?? null;
  const removed: string[] = [];
  const previewFile = formData.get("previewFile");
  if (previewFile instanceof File && previewFile.size > 0) {
    const up = await uploadImage(parsed.value.slug, previewFile);
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
      const up = await uploadImage(parsed.value.slug, f);
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
```

- [ ] **Step 3: Typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add src/lib/projects-admin.ts src/app/admin/projects/actions.ts
git commit -m "Add the admin data layer and actions for projects"
```

---

### Task 6: Admin list and editor

**Files:**
- Create: `src/app/admin/projects/page.tsx`, `src/app/admin/projects/[id]/page.tsx`, `src/app/admin/projects/[id]/project-form.tsx`
- Modify: `src/app/admin/layout.tsx`

**Interfaces:**
- Consumes: Task 5 data layer and actions; `ProjectRow`.

- [ ] **Step 1: Add the nav link in `src/app/admin/layout.tsx`**

Inside the `<nav aria-label="Admin" ...>` add after the Messages link:
```tsx
          <Link href="/admin/projects" className="label !text-fg">
            Projects
          </Link>
```

- [ ] **Step 2: Create the list** `src/app/admin/projects/page.tsx`

```tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { adminListProjects } from "@/lib/projects-admin";
import { moveProject, setPublished } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProjects() {
  await requireAdmin();
  const projects = await adminListProjects();
  return (
    <>
      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="title">Projects</h1>
        <Link href="/admin/projects/new" className="bg-accent px-2 py-1 font-mono text-[12px] uppercase tracking-[0.08em] !text-black">
          New project
        </Link>
      </div>
      <ul className="border-t border-line">
        {projects.map((p, i) => (
          <li key={p.id} className="grid grid-cols-12 items-center gap-x-3 gap-y-1 border-b border-line py-2">
            <span className="label col-span-1">{String(i + 1).padStart(2, "0")}</span>
            <span className="col-span-11 md:col-span-4">
              <Link href={`/admin/projects/${p.id}`} className="font-heading text-[18px] font-bold tracking-[-0.03em] hover:!text-accent">
                {p.name}
              </Link>
              <span className="label ml-2">{p.study ? "Case study" : "Project"}</span>
            </span>
            <span className="label col-span-6 md:col-span-3">{p.published ? "Published" : "Hidden"}</span>
            <div className="col-span-6 flex justify-end gap-3 md:col-span-4">
              <form action={moveProject.bind(null, p.id, "up")}>
                <button type="submit" disabled={i === 0} aria-label={`Move ${p.name} up`} className="label hover:!text-fg disabled:opacity-30">
                  Up
                </button>
              </form>
              <form action={moveProject.bind(null, p.id, "down")}>
                <button type="submit" disabled={i === projects.length - 1} aria-label={`Move ${p.name} down`} className="label hover:!text-fg disabled:opacity-30">
                  Down
                </button>
              </form>
              <form action={setPublished.bind(null, p.id, !p.published)}>
                <button type="submit" className="label hover:!text-fg">
                  {p.published ? "Hide" : "Show"}
                </button>
              </form>
              <Link href={`/admin/projects/${p.id}`} className="label !text-fg">
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
```

- [ ] **Step 3: Create the editor page** `src/app/admin/projects/[id]/page.tsx`

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { adminGetProject } from "@/lib/projects-admin";
import { deleteProject } from "../actions";
import { ProjectForm } from "./project-form";

export const dynamic = "force-dynamic";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const row = id === "new" ? null : await adminGetProject(id);
  if (id !== "new" && !row) notFound();
  const imageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/`;
  return (
    <>
      <Link href="/admin/projects" className="label hover:!text-fg">
        ← Projects
      </Link>
      <h1 className="title mb-4 mt-2">{row ? row.name : "New project"}</h1>
      <ProjectForm row={row} imageBase={imageBase} />
      {row && (
        <form action={deleteProject.bind(null, row.id)} className="mt-12 grid max-w-[560px] gap-2 border-t border-line pt-3">
          <p className="label">Delete project</p>
          <label className="flex items-center gap-2">
            <input type="checkbox" required />
            <span className="text-[15px]">I understand this removes the project and its images.</span>
          </label>
          <button type="submit" className="label justify-self-start hover:!text-fg">
            Delete
          </button>
        </form>
      )}
    </>
  );
}
```

- [ ] **Step 4: Create the form** `src/app/admin/projects/[id]/project-form.tsx`

```tsx
"use client";

import { startTransition, useActionState } from "react";
import type { ProjectRow } from "@/lib/project-mapper";
import { saveProject, type ProjectFormState } from "../actions";

const box = "w-full border border-line bg-transparent px-2 py-1 text-[16px] text-fg outline-none focus:border-fg";
const initial: ProjectFormState = {};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="text-[13px] text-muted">{hint}</span>}
    </label>
  );
}

const join = (xs: string[] | undefined) => (xs ?? []).join("\n\n");

export function ProjectForm({ row, imageBase }: { row: ProjectRow | null; imageBase: string }) {
  const [state, action, pending] = useActionState(saveProject, initial);
  const s = row?.study;
  return (
    <form
      // Submitting through startTransition keeps the typed values when an error comes back.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="grid max-w-[720px] gap-3"
    >
      <input type="hidden" name="id" defaultValue={row?.id ?? ""} />
      <Field label="Slug" hint="Lowercase letters, digits and hyphens. It is the page address.">
        <input name="slug" required defaultValue={row?.slug} className={box} />
      </Field>
      <Field label="Name">
        <input name="name" required defaultValue={row?.name} className={box} />
      </Field>
      <Field label="Year">
        <input name="year" required defaultValue={row?.year} className={box} />
      </Field>
      <Field label="One line">
        <input name="oneLiner" required defaultValue={row?.one_liner} className={box} />
      </Field>
      <Field label="Role">
        <input name="role" required defaultValue={row?.role} className={box} />
      </Field>
      <Field label="Team (optional)">
        <input name="team" defaultValue={row?.team ?? ""} className={box} />
      </Field>
      <Field label="Context (optional)">
        <input name="context" defaultValue={row?.context ?? ""} className={box} />
      </Field>
      <Field label="Stack" hint="Comma separated, for example Next.js, Supabase.">
        <input name="stack" defaultValue={row?.stack.join(", ")} className={box} />
      </Field>
      <Field label="Problem">
        <textarea name="problem" rows={4} defaultValue={row?.problem} className={box} />
      </Field>
      <Field label="What I built">
        <textarea name="decision" rows={4} defaultValue={row?.decision} className={box} />
      </Field>
      <Field label="Result">
        <textarea name="result" rows={4} defaultValue={row?.result} className={box} />
      </Field>
      <Field label="In the code" hint="One per line: text | path">
        <textarea name="inCode" rows={5} defaultValue={row?.in_code.map((c) => (c.path ? `${c.text} | ${c.path}` : c.text)).join("\n")} className={box} />
      </Field>
      <Field label="Size" hint="One per line, for example 16 migrations.">
        <textarea name="scale" rows={3} defaultValue={row?.scale.join("\n")} className={box} />
      </Field>

      <fieldset className="grid gap-2 border border-line p-2">
        <legend className="label px-1">Links</legend>
        <Field label="Repository">
          <select name="repoKind" defaultValue={row?.repo_kind ?? "none"} className={box}>
            <option value="none">None</option>
            <option value="public">Public repository</option>
            <option value="team">Team repository</option>
            <option value="private">Private repository (label only)</option>
          </select>
        </Field>
        <Field label="Repository link (https)">
          <input name="repoUrl" defaultValue={row?.repo_url ?? ""} className={box} />
        </Field>
        <Field label="Live site (https, optional)">
          <input name="liveUrl" defaultValue={row?.live_url ?? ""} className={box} />
        </Field>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="internal" defaultChecked={row?.internal} />
          <span className="text-[15px]">Internal tool</span>
        </label>
      </fieldset>

      <fieldset className="grid gap-2 border border-line p-2">
        <legend className="label px-1">Screenshots</legend>
        {row?.preview_path && (
          <div className="grid gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageBase + row.preview_path} alt="Current preview" className="max-h-[160px] w-auto border border-line" />
            <label className="flex items-center gap-2">
              <input type="checkbox" name="removePreview" />
              <span className="text-[15px]">Remove the preview</span>
            </label>
          </div>
        )}
        <Field label="New preview (png, jpeg or webp, up to 5 MB)">
          <input type="file" name="previewFile" accept="image/png,image/jpeg,image/webp" className={box} />
        </Field>
        {row?.result_images.map((p) => (
          <label key={p} className="flex items-center gap-2">
            <input type="checkbox" name="removeResult" value={p} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageBase + p} alt="Result screenshot" className="max-h-[80px] w-auto border border-line" />
            <span className="text-[15px]">Remove</span>
          </label>
        ))}
        <Field label="Add result screenshots">
          <input type="file" name="resultFiles" multiple accept="image/png,image/jpeg,image/webp" className={box} />
        </Field>
      </fieldset>

      <fieldset className="grid gap-2 border border-line p-2">
        <legend className="label px-1">Case study</legend>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="study" defaultChecked={!!s} />
          <span className="text-[15px]">This project has a full case study</span>
        </label>
        <p className="text-[13px] text-muted">Separate paragraphs with a blank line.</p>
        <Field label="Summary at the top (optional)">
          <textarea name="studySummary" rows={4} defaultValue={join(s?.summary)} className={box} />
        </Field>
        <Field label="Problem">
          <textarea name="studyProblem" rows={4} defaultValue={join(s?.problem)} className={box} />
        </Field>
        <Field label="What was missing">
          <textarea name="studyMissing" rows={4} defaultValue={join(s?.missing)} className={box} />
        </Field>
        <Field label="How I investigated">
          <textarea name="studyInvestigation" rows={4} defaultValue={join(s?.investigation)} className={box} />
        </Field>
        <Field label="What I built">
          <textarea name="studyDecision" rows={6} defaultValue={join(s?.decision)} className={box} />
        </Field>
        <Field label="Technical details (optional, shown collapsed)">
          <textarea name="studyTechnical" rows={6} defaultValue={join(s?.technical)} className={box} />
        </Field>
        <Field label="Result">
          <textarea name="studyResult" rows={4} defaultValue={join(s?.result)} className={box} />
        </Field>
      </fieldset>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="published" defaultChecked={row ? row.published : true} />
        <span className="text-[15px]">Published</span>
      </label>

      {state.error && (
        <p role="alert" className="text-[15px]">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="justify-self-start bg-accent px-3 py-1 font-mono text-[12px] uppercase tracking-[0.08em] text-black disabled:opacity-50">
        {pending ? "Saving" : "Save project"}
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Typecheck, build and commit**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors; build lists `/admin/projects` and `/admin/projects/[id]`.

```bash
git add src/app/admin
git commit -m "Add the projects list and editor"
```

---

### Task 7: Verification and merge

- [ ] **Step 1: Local run against the real database**

Run `npm run dev`, log in at `/login` (link by email), then check at `/admin/projects`:
1. The seven projects appear in the original order.
2. Hide "AirLife", reload `/work`: it disappears. Show it again: it returns.
3. Move a project down and up: the order on Home and `/work` follows.
4. Edit Molted: change the one line, save. `/work/molted` shows the change.
5. Create a project "Test project" with slug `test-project`, a preview image and a result image. Open `/work/test-project`: both images render. Then delete it with the checkbox. The images disappear from the bucket.
6. Save with an invalid slug (`Bad Slug`): the error shows and the typed values stay.
7. Save a case study with an empty "Result": the error shows.

- [ ] **Step 2: Full checks**

Run: `npm test && npx tsc --noEmit && npm run build`
Expected: all pass.

- [ ] **Step 3: Merge and deploy**

```bash
git checkout main
git merge feature/projects-cms
git push origin main
```
Check the deployment: `gh api repos/teodor-vladconstantin/constantinBusiness/commits/$(git rev-parse HEAD)/status`. Expected: success.

- [ ] **Step 4: Live checks and Lighthouse**

Open the live Home, `/work`, `/work/joben`, `/admin/projects` (redirects to `/login` when logged out). Run Lighthouse mobile on Home and `/work/joben`. Expected: scores stay at 95 or above.
