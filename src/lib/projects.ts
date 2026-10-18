// Project content. Every statement comes from site-facts/ and decisions.md.
// Counts are from the repositories (git history, migrations, test files).

export type RepoLink =
  | { kind: "public"; url: string; label: string }
  | { kind: "team"; url: string; label: string }
  | { kind: "private"; label: "Private repository" };

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
  preview?: string; // file in public/previews
  internal?: boolean; // internal tool, no public product page
  case?: boolean; // has a full case study at /work/<slug>
  live?: string;
};

const priv = { kind: "private", label: "Private repository" } as const;

export const projects: Project[] = [
  {
    slug: "thinkup-intra",
    name: "ThinkUp-Intra",
    year: "2026",
    oneLiner: "Invite-only intranet for ThinkUp Academy with a county and zone map.",
    role: "Tech Director. Author of all 38 commits.",
    team: "Team of 3, built with the ThinkUp team.",
    stack: ["Next.js", "TypeScript", "Tailwind", "Supabase", "Clerk", "Leaflet", "Resend"],
    problem:
      "ThinkUp Academy runs work across departments and a National Program with schools, counties and ambassador students. It needed one internal place for tasks, meetings, decisions and that program.",
    decision:
      "Postgres row level security decides access. The interface mirrors those rules and server actions check them again. A county changes zone only through one database function, and the map color comes from the zone table.",
    result:
      "An internal, invite-only intranet with 6 roles, 3 departments and a student platform. Schools and ambassador students follow their county when it changes zone. More than 20 ThinkUp people use it daily to assign tasks, create projects, follow ambassador students and give feedback.",
    inCode: [
      { text: "Permission rules are pure functions with tests.", path: "src/lib/permissions.ts" },
      { text: "The service role key lives in one server-only file.", path: "src/lib/supabase/admin.ts" },
      { text: "County to zone moves go through move_county() and write a history row.", path: "supabase/migrations/20261004000000_intranet_schema.sql" },
      { text: "County boundaries come from public data, reduced to code and name.", path: "scripts/build-counties-geojson.ts" },
      { text: "School contact data stays out of activity logs.", path: "supabase/migrations/20261004000500_pn.sql" },
    ],
    scale: ["38 commits", "16 migrations", "7 test files", "6 roles, 3 departments"],
    repo: { kind: "public", label: "Repository", url: "https://github.com/teodor-vladconstantin/ThinkUp-Intra" },
    internal: true,
  },
  {
    slug: "nyra",
    name: "Nyra",
    year: "2026",
    oneLiner: "ATS for a single internal business.",
    role: "Designed and built the application.",
    stack: ["Next.js", "TypeScript", "Supabase", "Python", "FastAPI", "LlamaParse"],
    problem:
      "A single business tracked candidates in spreadsheets and email. It needed automatic CV parsing and one place to review applicants.",
    decision:
      "Parsing runs as a separate Python service with retries and a sweeper for stuck jobs. Extracted fields are validated, and anomalies mark the candidate for review. Data is isolated per organization in the schema from the first migration.",
    result:
      "A candidate table and kanban with keyword search, notes, CSV export, duplicate merge, an append-only audit log and retention controls.",
    inCode: [
      { text: "Parse jobs are claimed atomically and retried 3 times with backoff.", path: "parser/reliability.py" },
      { text: "Duplicates match on file hash, email or phone, and merging runs in one transaction.", path: "supabase/migrations/20261001010000_data_trust.sql" },
      { text: "The audit log is append-only, even for admins, and masks personal data.", path: "web/lib/audit.ts" },
      { text: "Database tests run on Postgres in WASM with every migration applied.", path: "web/tests/_pglite.mjs" },
    ],
    scale: ["11 migrations", "7 database test files", "PDF and DOCX up to 10 MB"],
    repo: priv,
    preview: "nyra.png",
    live: "https://nyra.joben.eu",
    case: true,
  },
  {
    slug: "joben",
    name: "Joben",
    year: "2026",
    oneLiner: "Resume builder with an ATS check that works without an account.",
    role: "Author of 419 of 421 commits.",
    stack: ["Next.js", "TypeScript", "Supabase", "Clerk", "Anthropic API", "Stripe", "Upstash Redis", "next-intl"],
    problem:
      "Job seekers need to know whether automated screening can read their resume. A sign-up form in front of the answer slows them down.",
    decision:
      "Two public checks run without an account. One calls the model and allows one scan per day per visitor. One has no model call and is limited by IP. Uploaded files are parsed locally and never stored.",
    result:
      "A resume builder in English and Romanian with ATS scoring, bullet suggestions, cover letters, PDF export and Stripe billing. Live at joben.eu with more than 50 active users.",
    inCode: [
      { text: "The public check has no auth and never reads user or resume tables.", path: "src/app/api/public/ats-check/route.ts" },
      { text: "Rate limits need both the IP and a device cookie under the cap, and fail closed when Redis errors.", path: "src/lib/security/route-rate-limit.ts" },
      { text: "Email capture uses double opt-in.", path: "src/app/api/public/ats-check/confirm/route.ts" },
      { text: "Model output is filtered for false positive issues before display.", path: "src/lib/ats-issue-guardrails.ts" },
      { text: "PDF export and resume parsing run as separate services.", path: "latex-service, resume-parser-service" },
    ],
    scale: ["421 commits", "26 migrations", "82 test files", "2 languages"],
    repo: { kind: "public", label: "Repository", url: "https://github.com/teodor-vladconstantin/joben-ai-resume" },
    live: "https://joben.eu",
    preview: "joben.png",
    case: true,
  },
  {
    slug: "molted",
    name: "Molted",
    year: "2026",
    oneLiner: "Habit app built as an RPG, with an AI coach.",
    role: "81 of 156 commits are mine.",
    team: "Built with 3 teammates.",
    context: "Entry in the High School Innovation Challenge.",
    stack: ["Vite", "JavaScript", "Tailwind", "Supabase", "Clerk", "Edge Functions", "pgvector"],
    problem:
      "Build a self-improvement and study coach for teenagers that adapts its plan from real behavior.",
    decision:
      "Game rules live in one pure module with tests. The coach agent can cite a source only if a tool returned it, and its proposals are validated before use. AI text is generated by the model or not shown.",
    result:
      "A habit tracker with momentum, levels, streaks, groups and a character that evolves, plus a weekly coach job that logs its actions and measures their effect. Live at molted.eu. 20 users in the first week.",
    inCode: [
      { text: "Game rules are one pure module with its own tests.", path: "apps/app/src/lib/engine.js" },
      { text: "One codebase builds a web app with Supabase and a standalone page without it.", path: "apps/app/src/lib/supabase.js" },
      { text: "Row level security comes with a SQL check that runs in a rolled-back transaction.", path: "supabase/tests/rls.sql" },
      { text: "Coach sources are citable only if a tool returned them.", path: "supabase/functions/_shared/agent-core.js" },
      { text: "The weekly job uses deterministic rules and measures each action's effect.", path: "supabase/functions/_shared/weekly-core.js" },
    ],
    scale: ["156 commits", "16 migrations", "5 Edge Functions", "25 habits on 5 paths, 10 levels"],
    repo: { kind: "team", label: "Team repository", url: "https://github.com/Vladutziss/HSIC" },
    live: "https://molted.eu",
    preview: "molted.png",
  },
  {
    slug: "thinkup-gateway",
    name: "ThinkUp Gateway",
    year: "2026",
    oneLiner: "Presentation site of think-up.academy, with the recruitment system, a blog and contact.",
    role: "Tech Director. Author of 43 of 49 commits.",
    team: "Team of 3, built with the ThinkUp team.",
    stack: ["Vite", "React", "TypeScript", "Tailwind", "shadcn/ui", "Supabase"],
    problem:
      "ThinkUp Academy needed a presentation site for think-up.academy and the infrastructure of its recruitment system, with staff managing the content themselves.",
    decision:
      "Recruitment opens and closes from settings, and the form stays hidden if the setting cannot be read. Admin sections are gated by role, and an Edge Function creates admin accounts.",
    result:
      "The presentation site of think-up.academy, with departments, blog, partners and contact. Behind it sits the recruitment system: an admin dashboard for applications, members, content and recruitment status.",
    inCode: [
      { text: "The application form fails closed when the recruitment setting cannot be read.", path: "src/pages/JoinUs.tsx" },
      { text: "Routes and navigation are gated by role.", path: "src/pages/admin" },
      { text: "Admin accounts are created by an Edge Function.", path: "supabase/functions/create-user/index.ts" },
      { text: "Recruitment moved from one applications table to program-based tables.", path: "supabase/migrations/20260829140000_recruitment_full.sql" },
    ],
    scale: ["49 commits", "9 migrations"],
    repo: { kind: "public", label: "Repository", url: "https://github.com/teodor-vladconstantin/thinkup-gateway" },
    preview: "thinkup-gateway.png",
    live: "https://think-up.academy",
  },
  {
    slug: "divein",
    name: "DiveIn",
    year: "2025",
    oneLiner: "Platform connecting youth organizations and young people through opportunities.",
    role: "Owner. 66 of 74 commits are mine.",
    team: "Team of 8.",
    stack: ["Vite", "React", "TypeScript", "Tailwind", "shadcn/ui", "Supabase"],
    problem:
      "Civic and educational opportunities for young people in Romania are spread across many places. DiveIn gathers them in one.",
    decision:
      "Two roles, organization and talent, each with its own dashboard. Access rules live in the database as row level security. Business rules sit in one config file.",
    result:
      "A site where organizations post and edit opportunities, talents create profiles and apply, and organizations manage their applications. The interface is in Romanian. It brought together more than 50 opportunities and reached 170+ young people.",
    inCode: [
      { text: "Roles are defined once and drive both dashboards.", path: "src/lib/roles.ts" },
      { text: "Row level security covers organizations, opportunities and applications.", path: "supabase/migrations/20250805094022_02188b35-d8d3-4175-93ac-1d492a07249e.sql" },
      { text: "Reactivating an expired opportunity extends its date by 7 days, set in one config file.", path: "src/config/business-rules.ts" },
    ],
    scale: ["74 commits", "19 routes", "4 migrations"],
    repo: { kind: "public", label: "Repository", url: "https://github.com/TeodorCtin/divein-buzau-final" },
    preview: "divein.png",
  },
  {
    slug: "airlife",
    name: "AirLife",
    year: "2025",
    oneLiner: "Online shop for air conditioners, air purifiers and dehumidifiers.",
    role: "7 commits are mine, 9 come from the Lovable tool.",
    team: "Team of 1.",
    stack: ["Vite", "React", "TypeScript", "Tailwind", "shadcn/ui", "Supabase", "React Query"],
    problem:
      "A business selling air conditioners, air purifiers and dehumidifiers needed an online shop with orders it could process.",
    decision:
      "The cart syncs between the browser and the database, so guests keep their cart and it merges at login. Order numbers and stock changes run as database functions. Stock is checked before each order is created.",
    result:
      "A shop with cart, checkout, order history for customers, payment by cash on delivery or bank transfer, and an admin panel for order status, tracking number, courier and notes. The site is live at airlife.ro and currently shows a coming soon page.",
    inCode: [
      { text: "Guest carts live in local storage and merge into the database cart at login.", path: "src/contexts/CartContext.tsx" },
      { text: "Order numbers and stock decrease run as database functions called through RPC.", path: "src/pages/Checkout.tsx" },
      { text: "Shipping is 20 RON, free from 500 RON.", path: "src/pages/Checkout.tsx" },
      { text: "Order status, tracking number and courier are managed in the admin.", path: "src/components/admin/OrderDetailsDialog.tsx" },
    ],
    scale: ["3 migrations"],
    repo: priv,
    live: "https://airlife.ro",
    preview: "airlife.png",
  },
];

// Host shown as the link text, for example "joben.eu".
export const liveHost = (url: string) => new URL(url).host.replace(/^www./, "");

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
