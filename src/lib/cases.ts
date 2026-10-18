// Case study copy for the two featured projects. Facts come from site-facts/ and the owner.

export type CaseStudy = {
  slug: "joben" | "nyra";
  note?: string;
  summary?: string[]; // plain-language outcome shown at the top
  technical?: string[]; // shown collapsed under "Technical details"
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
    summary: [
      "A small business tracked job candidates in spreadsheets and email, and someone copied each CV by hand.",
      "I built one tool where CVs are uploaded and read automatically.",
      "Every candidate shows up in one table or board, with notes, search and export.",
      "Duplicates are caught, every change is logged, and personal data is kept only as long as the business decides and erased on request.",
    ],
    problem: [
      "A small business tracked job candidates in spreadsheets and email. CVs arrived as files. Someone opened each one and copied the details by hand.",
    ],
    missing: [
      "There was no single place for candidates. The same person could show up twice. Nobody could see who changed a record.",
      "Candidate data is personal data. The business needs to control how long it keeps that data and to erase it on request.",
    ],
    investigation: [
      "I started from how the business works: one company, a small team, and a first version that had to stay simple.",
      "Reading CVs is the risky part, because it depends on an outside service that can be slow or fail. I kept it apart from the rest of the application so a failure there stays contained.",
    ],
    decision: [
      "The tool reads each uploaded CV and fills in the contact details and work history.",
      "When something looks wrong, it marks the candidate for review. A person's edits are never overwritten.",
      "Duplicate candidates are matched, and an admin merges them without losing notes or tags.",
      "Every change is logged, and the log cannot be edited, even by admins. The business sets how long personal data is kept, and any candidate can be exported or erased.",
    ],
    technical: [
      "Parsing runs as a separate Python service. A job is claimed once, retried three times with backoff, and a sweeper picks up jobs that got stuck.",
      "Extracted fields are checked and normalized. Anomalies mark the candidate for review. Fields a person edited are not overwritten when a CV is reprocessed.",
      "Duplicates match on file hash, email or phone. A merge runs in one database transaction that keeps experiences, notes and tags.",
      "The audit log is append-only and written by database triggers. It masks personal data. Each organization sets a retention period, and expired candidates are purged.",
      "Data is separated per organization from the first migration, and the interface serves one organization.",
      "Database tests run on Postgres compiled to WASM with every migration applied. CI runs lint, types, database tests, the build and the parser tests.",
    ],
    // TODO: Duku confirms a metric for the result (for example hours saved or candidates handled) before it is added.
    result: [
      "A candidate table and board with keyword search, notes, CSV export and an inline CV viewer.",
      "The repository is private.",
    ],
  },
];

export const getCase = (slug: string) => cases.find((c) => c.slug === slug);
