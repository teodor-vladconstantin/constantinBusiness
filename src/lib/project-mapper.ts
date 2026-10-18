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
