// Project index. Order, names and repo labels come from decisions.md.
// Copy, stack and numbers are added in Step 3 from the approved facts.

export type RepoLink =
  | { kind: "public"; url: string; label: string }
  | { kind: "team"; url: string; label: string }
  | { kind: "private"; label: "Private repository" };

export type Project = {
  slug: string;
  name: string;
  year: string; // year of the first commit
  repo?: RepoLink; // omitted when no repository is shown
  live?: string;
};

export const projects: Project[] = [
  { slug: "thinkup-intra", name: "ThinkUp-Intra", year: "2026", repo: { kind: "private", label: "Private repository" } },
  { slug: "nyra", name: "Nyra", year: "2026", repo: { kind: "private", label: "Private repository" } },
  { slug: "joben", name: "Joben", year: "2026", live: "https://joben.eu" },
  { slug: "molted", name: "Molted", year: "2026", repo: { kind: "team", label: "Team repository", url: "https://github.com/Vladutziss/HSIC" }, live: "https://www.molted.eu" },
  { slug: "thinkup-gateway", name: "ThinkUp Gateway", year: "2026", repo: { kind: "private", label: "Private repository" } },
  { slug: "divein", name: "DiveIn", year: "2025", repo: { kind: "public", label: "Repository", url: "https://github.com/TeodorCtin/divein-buzau-final" } },
  { slug: "airlife", name: "AirLife", year: "2025", repo: { kind: "private", label: "Private repository" } },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
