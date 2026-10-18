// Case study copy for the two featured projects. Facts come from site-facts/ and the owner.

export type CaseStudy = {
  slug: "joben" | "nyra";
  note?: string;
  problem: string[];
  missing: string[];
  investigation: string[];
  decision: string[];
  result: string[];
};

export const cases: CaseStudy[] = [
  {
    slug: "joben",
    problem: [
      "People send resumes and hear nothing back. Many companies run resumes through an automated screening system first. Most candidates never learn whether that system could read theirs.",
      "Joben answers that question. It scores a resume from 0 to 100, points to weak bullets and rewrites them, writes cover letters and exports a PDF. The interface is in English and Romanian.",
    ],
    missing: [
      "The first thing a person does with Joben is check a resume. That check sat behind an account. A visitor had to sign up before seeing any result.",
      "The homepage button added to it. It sent visitors to sign-up instead of the checker.",
    ],
    investigation: [
      "I walked the path a visitor takes from the homepage to the first result. That is where I found the button.",
      "The free check calls a language model, and every call costs money. An open check needs limits before it can go public. That shaped the decisions below.",
    ],
    decision: [
      "I removed the login from the check. Two public checks run without an account.",
      "One check calls the model and allows one scan per day per visitor. The other has no model call and allows 20 per hour per IP address.",
      "The rate limit needs both the IP address and a device cookie to be under the cap. If Redis fails, the limit denies the request.",
      "Text is extracted on the server and the file is never stored. The public check never touches user or resume tables. Model output goes through a filter that removes false positive issues before a visitor sees it.",
      "Email capture uses double opt-in. A scan made without an account carries into the new account at sign-up.",
      "PDF export and resume parsing run as separate services.",
    ],
    result: [
      "Joben is live at joben.eu in English and Romanian, with more than 50 active users.",
      "The repository has 421 commits and 82 test files. I wrote 419 of the commits.",
    ],
  },
  {
    slug: "nyra",
    problem: [
      "A small business tracked job candidates in spreadsheets and email. CVs arrived as files. Someone opened each one and copied the details by hand.",
      "I built an applicant tracking tool for them. It reads uploaded CVs and shows candidates in a table and a kanban board.",
    ],
    missing: [
      "There was no single place for candidates. The same person could show up twice. Nobody could see who changed a record.",
      "Candidate data is personal data. The business needs to control how long it keeps that data and to erase it on request.",
    ],
    investigation: [
      "I started from the scope. One business, a small team, and a first version that had to stay simple. I wrote the schema so data is separated per organization from the first migration, and kept the interface for one organization.",
      "CV parsing is the risky part. A third-party service reads the files, and it can be slow or fail. I treated it as its own concern, apart from the web app.",
    ],
    decision: [
      "Parsing runs as a separate Python service. A job is claimed once, retried three times with backoff, and a sweeper picks up jobs that got stuck.",
      "Extracted fields are checked and normalized. When something looks wrong, the candidate is marked for review. Fields a person edited are not overwritten when a CV is reprocessed.",
      "Duplicates match on file hash, email or phone. An admin merges two records in one database transaction that keeps experiences, notes and tags.",
      "The audit log is append-only, even for admins, and masks personal data. Each organization sets a retention period. Expired candidates are purged, and any candidate can be exported or erased.",
      "Database tests run on Postgres compiled to WASM with every migration applied. CI runs lint, types, database tests, the build and the parser tests.",
    ],
    result: [
      "A candidate table and kanban with keyword search, notes, CSV export and an inline CV viewer.",
      "The repository is private. I wrote all 16 commits.",
    ],
  },
];

export const getCase = (slug: string) => cases.find((c) => c.slug === slug);
