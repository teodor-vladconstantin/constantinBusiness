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
