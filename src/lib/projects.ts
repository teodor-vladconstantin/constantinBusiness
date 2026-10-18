// Project types. Content lives in the Supabase projects table and is edited from /admin/projects.

export type RepoLink =
  | { kind: "public"; url: string; label: string }
  | { kind: "team"; url: string; label: string }
  | { kind: "private"; label: "Private repository" };

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
  year: string; // year of the first commit
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
  repo?: RepoLink; // omitted when no repository is shown
  live?: string;
  preview?: string; // full image URL
  resultImages?: string[]; // full image URLs
  internal?: boolean; // internal tool, no public product page
  study?: StudySections; // set when the project has a full case study
};

// Host shown as the link text, for example "joben.eu".
export const liveHost = (url: string) => new URL(url).host.replace(/^www\./, "");

