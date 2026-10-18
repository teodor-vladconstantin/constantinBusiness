# Admin dashboard, contact form and CMS: design

Date: 2026-10-18. Scope: the personal site in this repo.

## Goal

The owner edits projects, writes blog posts and reads contact messages from a dashboard, without touching code. The contact form is protected by Cloudflare Turnstile.

## Decisions (confirmed by the owner)

- Data lives in Supabase (Postgres, Auth, Storage).
- Login is an email link. Only one address is accepted.
- No email notification for new messages. Messages are read in the dashboard.
- Projects are fully editable, including case study sections, technical details and screenshots.
- Blog posts are Markdown with a live preview.

## Phases

Each phase gets its own plan and ships on its own.

1. Contact form with Turnstile, `messages` table, login, admin shell, messages inbox.
2. Projects editor with image upload, plus a one-time seed from `src/lib/projects.ts` and `src/lib/cases.ts`.
3. Blog editor, replacing the MDX files in `content/blog`.

## Architecture

- Public pages read published rows from Supabase with the anon key. Row level security allows `select` on published rows only. Pages stay static. Saving in the dashboard calls `revalidatePath` for the affected pages.
- All writes run in server actions or route handlers. They check the session first, then use a server-only Supabase client with the service role key. That key never reaches the browser.
- `/admin` is guarded by middleware. A session whose email differs from `ADMIN_EMAIL` is rejected. Admin routes send `noindex`, are disallowed in `robots.txt` and are left out of the sitemap.
- Existing content in code is the seed source. After seeding, the database is the source of truth and the code data is deleted in phase 2.

## Data model

`messages`: id, name, email, message, created_at, read (bool). No public access.

`projects`: slug (unique), name, year, one_liner, role, team, context, stack (text[]), problem, decision, result, in_code (jsonb: text and path), scale (text[]), repo_kind (public, team, private), repo_url, repo_label, live_url, preview_path, result_images (text[] of storage paths), internal (bool), position (int), published (bool), study (jsonb, nullable: summary, problem, missing, investigation, decision, technical, result, each a list of paragraphs).

`posts`: slug (unique), title, excerpt, body_md, status (draft, published), published_at.

Storage bucket `images`: public read, writes from the server only. A project row references its images by storage path (`preview_path`, `result_images`).

## Contact form

- Fields: name, email, message, and a hidden honeypot field.
- Cloudflare Turnstile widget on `/contact`. The token is verified on the server against Cloudflare `siteverify` before anything is stored.
- Server validation: name 1 to 100 characters, email format, message 10 to 5000 characters, honeypot empty. Any failure returns a short error and stores nothing.
- On success the row is inserted and the form shows a confirmation.

## Dashboard

- Style matches the site: dark, Swiss, mono labels, no gradients.
- Messages: list with read and unread, open a message, mark read or unread, delete.
- Projects (phase 2): list with order and published switch, form for every field, image upload for preview and result screenshots.
- Blog (phase 3): list, Markdown editor with side preview, draft or published, image upload. Rendering uses a Markdown renderer with HTML sanitizing. No MDX from the database.

## Environment variables

Set by the owner in Vercel and in `.env.local`. The repo ships only `.env.example`.

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`

## Errors

- Turnstile or validation failure: inline message, no row stored.
- Supabase failure on submit: generic error, the visitor can retry.
- Supabase failure on public read at build time: the build fails, so a broken deploy never replaces a working one.

## Testing

- Unit tests for message validation and the Turnstile verification wrapper (Vitest).
- Manual check of login, a submit with a valid and an invalid token, mark read, delete, and a revalidation after saving.
- Lighthouse on Home and Contact after phase 1 to confirm no regression.

## Out of scope

Email notifications, multiple admin users, comments on the blog, analytics in the dashboard, WYSIWYG editing.
