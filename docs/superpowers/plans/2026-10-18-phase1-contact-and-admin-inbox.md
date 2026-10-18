# Phase 1: Contact form, Turnstile, login and messages inbox. Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Visitors send a message through a Turnstile-protected form. The owner logs in with an email link and reads, marks and deletes messages in `/admin`.

**Architecture:** A server action validates the form, verifies the Turnstile token against Cloudflare, then inserts into the Supabase `messages` table with a server-only service client. `/admin` is guarded twice: `src/proxy.ts` redirects visitors without a session, and every admin page and action calls `requireAdmin()`. Login is a Supabase email OTP link restricted to `ADMIN_EMAIL`.

**Tech Stack:** Next.js 16.4.1 (App Router, `proxy.ts`, Server Actions), React 19, TypeScript, Tailwind 4, `@supabase/supabase-js` 2.118.0, `@supabase/ssr` 0.12.7, `server-only`, Vitest 5.0.5, Cloudflare Turnstile.

## Global Constraints

- Style: dark, Swiss, bg #111113, text #F4F4F5, secondary #A1A1AA, hairlines #2A2A2E, accent #EAB308, one accent highlight per screen.
- No gradients, glow, blur, box shadows. Radius 0 to 2px.
- Copy: short sentences, no em dashes, no negation-then-positive structure, no hype words.
- Commits: no `Co-Authored-By` trailer (Vercel blocked a deployment over commit authorship earlier). Author stays the repo's configured user.
- Never open `.env*` files. Never print secrets. `.env.local` is already created by the owner and is git-ignored.
- Service role key and Turnstile secret are used only in server code that imports `server-only`.
- Admin routes are `noindex`, disallowed in `robots.txt` and absent from the sitemap.
- Message validation: name 1 to 100 characters, email format, message 10 to 5000 characters, honeypot field empty.
- Turnstile: explicit render, `action: "contact"`, token rejected when missing or longer than 2048 characters, server checks `success`, `action` and, when `TURNSTILE_HOSTNAMES` is set, `hostname`. The widget is reset after every submit.
- Next 16 conventions: `proxy.ts` replaces `middleware.ts`; `cookies()` and `headers()` are async; Server Functions live in files with `"use server"`.

## File Structure

| File | Responsibility |
|---|---|
| `vitest.config.ts` | Test runner config with the `@` alias |
| `src/lib/contact.ts` | `validateMessage` (pure) |
| `src/lib/contact.test.ts` | Tests for validation |
| `src/lib/turnstile.ts` | `verifyTurnstile` (server side siteverify call) |
| `src/lib/turnstile.test.ts` | Tests for verification |
| `supabase/migrations/0001_messages.sql` | `messages` table with RLS and no policies |
| `src/lib/supabase/admin.ts` | Service role client, server only |
| `src/lib/supabase/server.ts` | Cookie based client for the logged in admin |
| `src/lib/admin-auth.ts` | `isAdminEmail`, `requireAdmin` |
| `src/lib/messages.ts` | `listMessages`, `getMessage`, `setRead`, `removeMessage` |
| `src/app/contact/actions.ts` | `sendMessage` server action |
| `src/app/contact/contact-form.tsx` | Client form with the Turnstile widget |
| `src/app/contact/page.tsx` | Contact page using the form |
| `src/proxy.ts` | Session refresh and redirect for `/admin` |
| `src/app/login/page.tsx`, `src/app/login/actions.ts` | Email link login |
| `src/app/auth/callback/route.ts` | Exchanges the link code for a session |
| `src/app/admin/layout.tsx` | Guard, shell and sign out |
| `src/app/admin/page.tsx` | Redirect to messages |
| `src/app/admin/messages/page.tsx`, `src/app/admin/messages/[id]/page.tsx`, `src/app/admin/messages/actions.ts` | Inbox, detail, actions |
| `src/app/robots.ts` | Disallow `/admin` and `/login` |
| `.env.example`, `.gitignore` | Document variable names, allow committing the example |

## Owner setup (before manual verification, not before coding)

1. Supabase: Authentication, Users, "Add user" with the admin email, auto confirm on.
2. Supabase: Authentication, URL Configuration, add redirect URLs `http://localhost:3000/auth/callback` and `https://constantin-business.vercel.app/auth/callback` (and the final domain later).
3. Supabase: SQL editor, paste and run `supabase/migrations/0001_messages.sql` (created in Task 4).
4. Vercel: Project Settings, Environment Variables, add every name from `.env.example` with the values from `.env.local`, plus `TURNSTILE_HOSTNAMES=constantin-business.vercel.app`.
5. Cloudflare Turnstile: widget hostnames include `constantin-business.vercel.app`. For local tests use Cloudflare test keys (site key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`) in `.env.local`, because the real widget rejects `localhost` unless that hostname is added.

---

### Task 1: Tooling and environment example

**Files:**
- Modify: `package.json`, `.gitignore`
- Create: `vitest.config.ts`, `.env.example` (already written, now committed)

**Interfaces:**
- Produces: `npm test` runs Vitest once; `@/` alias works in tests.

- [ ] **Step 1: Install dependencies**

Run:
```bash
npm i --save-exact @supabase/supabase-js@2.118.0 @supabase/ssr@0.12.7 server-only
npm i -D --save-exact vitest@5.0.5
```
Expected: installs without peer errors.

- [ ] **Step 2: Add the test script**

In `package.json` `"scripts"`, add `"test": "vitest run"`.

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
```

- [ ] **Step 4: Allow committing `.env.example`**

Append to `.gitignore`:
```
!.env.example
```

- [ ] **Step 5: Add the hostname variable to `.env.example`**

Append:
```
# Comma separated hostnames Turnstile may report. Leave empty to skip the check.
TURNSTILE_HOSTNAMES=
```

- [ ] **Step 6: Verify and commit**

Run: `npm test`
Expected: "No test files found" (exit code 1 is acceptable at this point).

```bash
git add package.json package-lock.json vitest.config.ts .gitignore .env.example
git commit -m "Add Supabase, Vitest and the environment example"
```

---

### Task 2: Message validation (TDD)

**Files:**
- Create: `src/lib/contact.ts`
- Test: `src/lib/contact.test.ts`

**Interfaces:**
- Produces: `validateMessage(input: { name: string; email: string; message: string; website: string }): { ok: true; value: { name: string; email: string; message: string } } | { ok: false; error: string }`

- [ ] **Step 1: Write the failing test** `src/lib/contact.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { validateMessage } from "@/lib/contact";

const valid = { name: "Ada", email: "ada@example.com", message: "I need a small internal tool.", website: "" };

describe("validateMessage", () => {
  it("accepts a valid message and trims the fields", () => {
    const r = validateMessage({ ...valid, name: "  Ada  ", message: "  I need a small internal tool.  " });
    expect(r).toEqual({ ok: true, value: { name: "Ada", email: "ada@example.com", message: "I need a small internal tool." } });
  });

  it("rejects an empty name", () => {
    expect(validateMessage({ ...valid, name: "   " }).ok).toBe(false);
  });

  it("rejects a name longer than 100 characters", () => {
    expect(validateMessage({ ...valid, name: "a".repeat(101) }).ok).toBe(false);
  });

  it("rejects a bad email", () => {
    expect(validateMessage({ ...valid, email: "not-an-email" }).ok).toBe(false);
  });

  it("rejects a message shorter than 10 characters", () => {
    expect(validateMessage({ ...valid, message: "too short" }).ok).toBe(false);
  });

  it("rejects a message longer than 5000 characters", () => {
    expect(validateMessage({ ...valid, message: "a".repeat(5001) }).ok).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(validateMessage({ ...valid, website: "http://spam.example" }).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/contact.test.ts`
Expected: FAIL, "Failed to resolve import @/lib/contact".

- [ ] **Step 3: Implement** `src/lib/contact.ts`

```ts
export type MessageInput = { name: string; email: string; message: string; website: string };
export type ValidMessage = { name: string; email: string; message: string };
export type ValidationResult = { ok: true; value: ValidMessage } | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateMessage(input: MessageInput): ValidationResult {
  // The honeypot field is invisible to people. A value means a bot filled it.
  if (input.website.trim() !== "") return { ok: false, error: "Could not send the message." };
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  if (name.length < 1 || name.length > 100) return { ok: false, error: "Enter your name, up to 100 characters." };
  if (email.length > 254 || !EMAIL.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (message.length < 10 || message.length > 5000) return { ok: false, error: "Write a message of 10 to 5000 characters." };
  return { ok: true, value: { name, email, message } };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/lib/contact.test.ts`
Expected: 7 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/contact.ts src/lib/contact.test.ts
git commit -m "Add contact message validation"
```

---

### Task 3: Turnstile verification (TDD)

**Files:**
- Create: `src/lib/turnstile.ts`
- Test: `src/lib/turnstile.test.ts`

**Interfaces:**
- Produces: `verifyTurnstile(token: string, opts?: { secret?: string; ip?: string; action?: string; hostnames?: string[]; fetchImpl?: typeof fetch }): Promise<boolean>`. Defaults: `secret` from `TURNSTILE_SECRET_KEY`, `action` `"contact"`, `hostnames` from `TURNSTILE_HOSTNAMES` (comma separated), `fetchImpl` the global `fetch`.

- [ ] **Step 1: Write the failing test** `src/lib/turnstile.test.ts`

```ts
import { describe, expect, it, vi } from "vitest";
import { verifyTurnstile } from "@/lib/turnstile";

const reply = (body: unknown, ok = true) => vi.fn(async () => ({ ok, json: async () => body }) as Response);

describe("verifyTurnstile", () => {
  it("accepts a successful response with the right action", async () => {
    const f = reply({ success: true, action: "contact", hostname: "example.com" });
    expect(await verifyTurnstile("tok", { secret: "s", fetchImpl: f })).toBe(true);
  });

  it("sends secret, response and remoteip as a form body", async () => {
    const f = reply({ success: true, action: "contact" });
    await verifyTurnstile("tok", { secret: "s", ip: "1.2.3.4", fetchImpl: f });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(init.method).toBe("POST");
    const body = init.body as URLSearchParams;
    expect(body.get("secret")).toBe("s");
    expect(body.get("response")).toBe("tok");
    expect(body.get("remoteip")).toBe("1.2.3.4");
  });

  it("rejects an empty token without calling Cloudflare", async () => {
    const f = reply({ success: true });
    expect(await verifyTurnstile("", { secret: "s", fetchImpl: f })).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it("rejects a token longer than 2048 characters without calling Cloudflare", async () => {
    const f = reply({ success: true });
    expect(await verifyTurnstile("a".repeat(2049), { secret: "s", fetchImpl: f })).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it("rejects when the secret is missing", async () => {
    const f = reply({ success: true, action: "contact" });
    expect(await verifyTurnstile("tok", { secret: "", fetchImpl: f })).toBe(false);
  });

  it("rejects success false", async () => {
    expect(await verifyTurnstile("tok", { secret: "s", fetchImpl: reply({ success: false }) })).toBe(false);
  });

  it("rejects a different action", async () => {
    const f = reply({ success: true, action: "login" });
    expect(await verifyTurnstile("tok", { secret: "s", fetchImpl: f })).toBe(false);
  });

  it("rejects a hostname outside the allowlist", async () => {
    const f = reply({ success: true, action: "contact", hostname: "evil.example" });
    expect(await verifyTurnstile("tok", { secret: "s", hostnames: ["example.com"], fetchImpl: f })).toBe(false);
  });

  it("accepts a hostname inside the allowlist", async () => {
    const f = reply({ success: true, action: "contact", hostname: "example.com" });
    expect(await verifyTurnstile("tok", { secret: "s", hostnames: ["example.com"], fetchImpl: f })).toBe(true);
  });

  it("rejects a non-OK HTTP response", async () => {
    expect(await verifyTurnstile("tok", { secret: "s", fetchImpl: reply({ success: true }, false) })).toBe(false);
  });

  it("rejects when the request throws", async () => {
    const f = vi.fn(async () => {
      throw new Error("network");
    });
    expect(await verifyTurnstile("tok", { secret: "s", fetchImpl: f as unknown as typeof fetch })).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/turnstile.test.ts`
Expected: FAIL, "Failed to resolve import @/lib/turnstile".

- [ ] **Step 3: Implement** `src/lib/turnstile.ts`

```ts
import "server-only";

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileOptions = {
  secret?: string;
  ip?: string;
  action?: string;
  hostnames?: string[];
  fetchImpl?: typeof fetch;
};

const envHostnames = () =>
  (process.env.TURNSTILE_HOSTNAMES ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

// Asks Cloudflare whether the token is valid for this form. Any doubt returns false.
export async function verifyTurnstile(token: string, opts: TurnstileOptions = {}): Promise<boolean> {
  const secret = opts.secret ?? process.env.TURNSTILE_SECRET_KEY ?? "";
  if (!secret || !token || token.length > 2048) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (opts.ip) body.set("remoteip", opts.ip);

  try {
    const res = await (opts.fetchImpl ?? fetch)(SITEVERIFY, { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean; action?: string; hostname?: string };
    if (data.success !== true) return false;
    if (data.action !== (opts.action ?? "contact")) return false;
    const allowed = opts.hostnames ?? envHostnames();
    if (allowed.length > 0 && !allowed.includes(data.hostname ?? "")) return false;
    return true;
  } catch {
    return false;
  }
}
```

Note: `server-only` throws when imported outside a server context. Vitest runs in Node without the `react-server` condition, so add this alias to `vitest.config.ts` `resolve.alias`: `"server-only": fileURLToPath(new URL("./src/test/server-only.ts", import.meta.url))`, and create `src/test/server-only.ts` containing `export {};`.

- [ ] **Step 4: Add the alias and stub**

Create `src/test/server-only.ts`:
```ts
export {};
```
Edit `vitest.config.ts` so `alias` becomes:
```ts
alias: {
  "@": fileURLToPath(new URL("./src", import.meta.url)),
  "server-only": fileURLToPath(new URL("./src/test/server-only.ts", import.meta.url)),
},
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run`
Expected: 18 passed (7 validation, 11 Turnstile).

- [ ] **Step 6: Commit**

```bash
git add src/lib/turnstile.ts src/lib/turnstile.test.ts src/test/server-only.ts vitest.config.ts
git commit -m "Add Turnstile server verification"
```

---

### Task 4: Database table and Supabase clients

**Files:**
- Create: `supabase/migrations/0001_messages.sql`, `src/lib/supabase/admin.ts`, `src/lib/supabase/server.ts`, `src/lib/messages.ts`

**Interfaces:**
- Produces:
  - `supabaseAdmin(): SupabaseClient` (service role, server only)
  - `createSupabaseServer(): Promise<SupabaseClient>` (cookie session)
  - `type Message = { id: string; name: string; email: string; message: string; read: boolean; created_at: string }`
  - `insertMessage(v: { name: string; email: string; message: string }): Promise<boolean>`
  - `listMessages(): Promise<Message[]>` (newest first)
  - `getMessage(id: string): Promise<Message | null>`
  - `setRead(id: string, read: boolean): Promise<void>`
  - `removeMessage(id: string): Promise<void>`

- [ ] **Step 1: Create the migration** `supabase/migrations/0001_messages.sql`

```sql
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  message text not null check (char_length(message) between 10 and 5000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;
-- No policies on purpose. Only the service role key, used on the server, can read or write.
```

- [ ] **Step 2: Create `src/lib/supabase/admin.ts`**

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service role client. It bypasses row level security, so it stays on the server.
export function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
```

- [ ] **Step 3: Create `src/lib/supabase/server.ts`**

```ts
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client bound to the visitor's cookies. Used to read who is logged in.
export async function createSupabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called from a Server Component. The proxy refreshes the session instead.
        }
      },
    },
  });
}
```

- [ ] **Step 4: Create `src/lib/messages.ts`**

```ts
import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type Message = { id: string; name: string; email: string; message: string; read: boolean; created_at: string };

export async function insertMessage(v: { name: string; email: string; message: string }): Promise<boolean> {
  const { error } = await supabaseAdmin().from("messages").insert(v);
  return !error;
}

export async function listMessages(): Promise<Message[]> {
  const { data, error } = await supabaseAdmin().from("messages").select("*").order("created_at", { ascending: false });
  if (error) throw new Error("Could not load messages");
  return data as Message[];
}

export async function getMessage(id: string): Promise<Message | null> {
  const { data } = await supabaseAdmin().from("messages").select("*").eq("id", id).maybeSingle();
  return (data as Message | null) ?? null;
}

export async function setRead(id: string, read: boolean): Promise<void> {
  const { error } = await supabaseAdmin().from("messages").update({ read }).eq("id", id);
  if (error) throw new Error("Could not update the message");
}

export async function removeMessage(id: string): Promise<void> {
  const { error } = await supabaseAdmin().from("messages").delete().eq("id", id);
  if (error) throw new Error("Could not delete the message");
}
```

- [ ] **Step 5: Typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add supabase src/lib/supabase src/lib/messages.ts
git commit -m "Add messages table and Supabase clients"
```

---

### Task 5: Contact form with Turnstile

**Files:**
- Create: `src/app/contact/actions.ts`, `src/app/contact/contact-form.tsx`
- Modify: `src/app/contact/page.tsx`

**Interfaces:**
- Consumes: `validateMessage` (Task 2), `verifyTurnstile` (Task 3), `insertMessage` (Task 4).
- Produces: `sendMessage(prev: ContactState, formData: FormData): Promise<ContactState>` and `type ContactState = { ok: boolean; error?: string; values?: { name: string; email: string; message: string } }`. On every failure `values` carries what the visitor typed, so the form keeps it (React clears uncontrolled fields after an action).

- [ ] **Step 1: Create `src/app/contact/actions.ts`**

```ts
"use server";

import { headers } from "next/headers";
import { validateMessage } from "@/lib/contact";
import { insertMessage } from "@/lib/messages";
import { verifyTurnstile } from "@/lib/turnstile";

export type ContactState = { ok: boolean; error?: string; values?: { name: string; email: string; message: string } };

const field = (f: FormData, k: string) => String(f.get(k) ?? "");

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values = { name: field(formData, "name"), email: field(formData, "email"), message: field(formData, "message") };
  const checked = validateMessage({ ...values, website: field(formData, "website") });
  if (!checked.ok) return { ok: false, error: checked.error, values };

  const forwarded = (await headers()).get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || undefined;
  const human = await verifyTurnstile(field(formData, "cf-turnstile-response"), { ip, action: "contact" });
  if (!human) return { ok: false, error: "The check did not pass. Please try again.", values };

  const stored = await insertMessage(checked.value);
  if (!stored) return { ok: false, error: "Could not send the message. Please try again.", values };
  return { ok: true };
}
```

- [ ] **Step 2: Create `src/app/contact/contact-form.tsx`**

```tsx
"use client";

import Script from "next/script";
import { useActionState, useEffect, useRef } from "react";
import { sendMessage, type ContactState } from "./actions";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const initial: ContactState = { ok: false };

const input = "w-full border border-line bg-transparent px-2 py-1 text-[16px] text-fg outline-none focus:border-fg";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, initial);
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);

  const mount = () => {
    if (!box.current || widget.current !== undefined || !window.turnstile) return;
    widget.current = window.turnstile.render(box.current, { sitekey: SITE_KEY, action: "contact", theme: "dark" });
  };

  // The token is single use, so ask for a new one after every submit.
  useEffect(() => {
    if (state.error) window.turnstile?.reset(widget.current);
  }, [state]);

  if (state.ok) {
    return <p className="prose-site">Thank you. Your message is sent. I reply by email.</p>;
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={mount} />
      <form action={action} className="grid max-w-[560px] gap-3" noValidate>
        <label className="grid gap-1">
          <span className="label">Name</span>
          <input name="name" type="text" required maxLength={100} autoComplete="name" defaultValue={state.values?.name} className={input} />
        </label>
        <label className="grid gap-1">
          <span className="label">Email</span>
          <input name="email" type="email" required maxLength={254} autoComplete="email" defaultValue={state.values?.email} className={input} />
        </label>
        <label className="grid gap-1">
          <span className="label">Message</span>
          <textarea name="message" required minLength={10} maxLength={5000} rows={6} defaultValue={state.values?.message} className={input} />
        </label>
        {/* Honeypot: hidden from people and from assistive tech. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div ref={box} />
        {state.error && (
          <p role="alert" className="text-[15px]">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className="justify-self-start bg-accent px-3 py-1 font-mono text-[12px] uppercase tracking-[0.08em] text-black disabled:opacity-50">
          {pending ? "Sending" : "Send message"}
        </button>
      </form>
    </>
  );
}
```

- [ ] **Step 2b: Check the button text color**

The global `a { color: inherit }` rule only affects links, so `text-black` on the button works. Confirm by viewing the form in Task 8.

- [ ] **Step 3: Use the form in `src/app/contact/page.tsx`**

Replace the first `Section` ("Write to me") with:

```tsx
import { ContactForm } from "./contact-form";
```
at the top, and
```tsx
      <Section n="01" title="Write to me">
        <p className="prose-site mb-3">Send a short description of the problem and the budget range.</p>
        <ContactForm />
        <p className="label mt-4">Or by email</p>
        <ul className="mt-1 grid gap-2">
          {site.emails.map((e, i) => (
            <li key={e}>
              <a className={`underline underline-offset-4 ${i === 0 ? "!text-accent" : ""}`} href={`mailto:${e}`}>
                {e}
              </a>
            </li>
          ))}
        </ul>
      </Section>
```
Keep the existing "Elsewhere" section unchanged.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/contact
git commit -m "Add the contact form with Turnstile"
```

---

### Task 6: Login and session guard

**Files:**
- Create: `src/lib/admin-auth.ts`, `src/proxy.ts`, `src/app/login/page.tsx`, `src/app/login/actions.ts`, `src/app/auth/callback/route.ts`

**Interfaces:**
- Consumes: `createSupabaseServer` (Task 4).
- Produces: `isAdminEmail(email?: string | null): boolean`, `requireAdmin(): Promise<{ email: string }>` (redirects to `/login` when not an admin), `sendLink(prev: LoginState, formData: FormData): Promise<LoginState>` with `type LoginState = { sent: boolean }`.

- [ ] **Step 1: Create `src/lib/admin-auth.ts`**

```ts
import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export function isAdminEmail(email?: string | null): boolean {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return !!admin && !!email && email.trim().toLowerCase() === admin;
}

// Call at the top of every admin page and action. getUser() asks Supabase to validate the session.
export async function requireAdmin(): Promise<{ email: string }> {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!email || !isAdminEmail(email)) redirect("/login");
  return { email };
}
```

- [ ] **Step 2: Create `src/proxy.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase session cookie on admin requests and sends visitors without a session to the login page.
// Pages and actions still call requireAdmin(). This is a first filter.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.redirect(new URL("/login", request.url));
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
```

- [ ] **Step 3: Create `src/app/login/actions.ts`**

```ts
"use server";

import { headers } from "next/headers";
import { isAdminEmail } from "@/lib/admin-auth";
import { site } from "@/lib/site";
import { createSupabaseServer } from "@/lib/supabase/server";

export type LoginState = { sent: boolean };

// The reply is the same for every address, so the form does not reveal which address is the admin.
export async function sendLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  if (isAdminEmail(email)) {
    const origin = (await headers()).get("origin") ?? site.url;
    const supabase = await createSupabaseServer();
    await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${origin}/auth/callback` },
    });
  }
  return { sent: true };
}
```

- [ ] **Step 4: Create `src/app/login/page.tsx`**

```tsx
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Login", robots: { index: false, follow: false } };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="container-site py-16 md:py-24">
      <p className="label mb-2">Admin</p>
      <h1 className="title mb-3">Login</h1>
      {error && (
        <p role="alert" className="mb-2">
          That link did not work. Request a new one.
        </p>
      )}
      <LoginForm />
    </div>
  );
}
```

And `src/app/login/login-form.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { sendLink, type LoginState } from "./actions";

const initial: LoginState = { sent: false };

export function LoginForm() {
  const [state, action, pending] = useActionState(sendLink, initial);
  if (state.sent) return <p className="prose-site">If that address is allowed, a login link is on its way. Open it on this device.</p>;
  return (
    <form action={action} className="grid max-w-[420px] gap-3">
      <label className="grid gap-1">
        <span className="label">Email</span>
        <input name="email" type="email" required autoComplete="email" className="w-full border border-line bg-transparent px-2 py-1 text-[16px] text-fg outline-none focus:border-fg" />
      </label>
      <button type="submit" disabled={pending} className="justify-self-start bg-accent px-3 py-1 font-mono text-[12px] uppercase tracking-[0.08em] text-black disabled:opacity-50">
        {pending ? "Sending" : "Send link"}
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Create `src/app/auth/callback/route.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { createSupabaseServer } from "@/lib/supabase/server";

// The login link lands here with a one-time code. Exchange it for a session, then check the address.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data } = await supabase.auth.getUser();
      if (isAdminEmail(data.user?.email)) return NextResponse.redirect(new URL("/admin/messages", request.url));
      await supabase.auth.signOut();
    }
  }
  return NextResponse.redirect(new URL("/login?error=1", request.url));
}
```

- [ ] **Step 6: Typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add src/lib/admin-auth.ts src/proxy.ts src/app/login src/app/auth
git commit -m "Add email link login and the admin session guard"
```

---

### Task 7: Admin shell and messages inbox

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/actions.ts`, `src/app/admin/messages/page.tsx`, `src/app/admin/messages/[id]/page.tsx`, `src/app/admin/messages/actions.ts`

**Interfaces:**
- Consumes: `requireAdmin` (Task 6), `listMessages`, `getMessage`, `setRead`, `removeMessage` (Task 4).
- Produces: `signOut(): Promise<void>`, `toggleRead(id: string, read: boolean): Promise<void>`, `deleteMessage(id: string): Promise<void>` (the last two redirect to `/admin/messages` or revalidate).

- [ ] **Step 1: Create `src/app/admin/actions.ts`**

```ts
"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
```

- [ ] **Step 2: Create `src/app/admin/layout.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { email } = await requireAdmin();
  return (
    <div className="container-site py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
        <nav aria-label="Admin" className="flex gap-3">
          <Link href="/admin/messages" className="label !text-fg">
            Messages
          </Link>
        </nav>
        <form action={signOut} className="flex items-center gap-2">
          <span className="label">{email}</span>
          <button type="submit" className="label hover:!text-fg">
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/admin/page.tsx`**

```tsx
import { redirect } from "next/navigation";

export default function AdminHome() {
  redirect("/admin/messages");
}
```

- [ ] **Step 4: Create `src/app/admin/messages/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { removeMessage, setRead } from "@/lib/messages";

export async function toggleRead(id: string, read: boolean) {
  await requireAdmin();
  await setRead(id, read);
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  await removeMessage(id);
  revalidatePath("/admin/messages");
  redirect("/admin/messages");
}
```

- [ ] **Step 5: Create `src/app/admin/messages/page.tsx`**

```tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { listMessages } from "@/lib/messages";

export const dynamic = "force-dynamic";

const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default async function Messages() {
  await requireAdmin();
  const messages = await listMessages();
  const unread = messages.filter((m) => !m.read).length;
  return (
    <>
      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="title">Messages</h1>
        <p className="label">{unread} unread / {messages.length} total</p>
      </div>
      {messages.length === 0 ? (
        <p className="prose-site text-muted">No messages yet.</p>
      ) : (
        <ul className="border-t border-line">
          {messages.map((m) => (
            <li key={m.id} className="border-b border-line">
              <Link href={`/admin/messages/${m.id}`} className="row-invert grid grid-cols-12 gap-x-3 px-1 py-2">
                <span className="label col-span-12 md:col-span-3">{when(m.created_at)}</span>
                <span className={`col-span-12 md:col-span-3 ${m.read ? "" : "font-bold"}`}>{m.name}</span>
                <span className="col-span-12 truncate md:col-span-6">{m.message}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
```

- [ ] **Step 6: Create `src/app/admin/messages/[id]/page.tsx`**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getMessage } from "@/lib/messages";
import { deleteMessage, toggleRead } from "../actions";

export const dynamic = "force-dynamic";

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const m = await getMessage(id);
  if (!m) notFound();
  return (
    <article className="max-w-[720px]">
      <Link href="/admin/messages" className="label hover:!text-fg">
        ← Messages
      </Link>
      <p className="label mt-3">{new Date(m.created_at).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}</p>
      <h1 className="title mt-1">{m.name}</h1>
      <p className="mt-1">
        <a className="underline underline-offset-4" href={`mailto:${m.email}`}>
          {m.email}
        </a>
      </p>
      <p className="prose-site mt-3 whitespace-pre-wrap">{m.message}</p>
      <div className="mt-4 flex gap-3 border-t border-line pt-3">
        <form action={toggleRead.bind(null, m.id, !m.read)}>
          <button type="submit" className="label hover:!text-fg">
            Mark as {m.read ? "unread" : "read"}
          </button>
        </form>
        <form action={deleteMessage.bind(null, m.id)}>
          <button type="submit" className="label hover:!text-fg">
            Delete
          </button>
        </form>
      </div>
    </article>
  );
}
```

- [ ] **Step 7: Typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add src/app/admin
git commit -m "Add the admin shell and the messages inbox"
```

---

### Task 8: SEO exclusion, build and verification

**Files:**
- Modify: `src/app/robots.ts`

- [ ] **Step 1: Disallow admin paths in `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/login", "/auth"] }, sitemap: `${site.url}/sitemap.xml` };
}
```
The sitemap (`src/app/sitemap.ts`) lists only public pages already. No change.

- [ ] **Step 2: Run tests, typecheck and build**

Run: `npm test && npx tsc --noEmit && npm run build`
Expected: 18 tests pass, no type errors, build lists `/admin`, `/login`, `/auth/callback`, `/contact`. Build must not need Supabase variables because no page reads the database at build time.

- [ ] **Step 3: Manual verification (needs the owner setup above and `NEXT_PUBLIC_SUPABASE_URL`)**

With the Cloudflare test keys in `.env.local`, run `npm run dev`, then check:
1. `/contact` shows the widget. Submit a valid message: the form shows the thank-you text, and the row appears in Supabase.
2. Submit with the honeypot filled (use devtools to type into `website`): an error appears, no row.
3. Submit with a 5 character message: validation error, no row.
4. `/admin/messages` while logged out redirects to `/login`.
5. Request a link with the admin email, open it: lands on `/admin/messages`.
6. Request a link with another email: same confirmation text, no email arrives.
7. Open a message, mark it unread and read, delete it.
8. `GET /robots.txt` lists the disallowed paths.

- [ ] **Step 4: Lighthouse on `/contact`**

Run Lighthouse mobile against the Vercel preview. Expected: Accessibility 100. Record the Performance score. Cloudflare's script loads after interaction, so a small drop is acceptable.

- [ ] **Step 5: Commit and push**

```bash
git add src/app/robots.ts
git commit -m "Disallow admin paths in robots.txt"
git push origin main
```
Expected: Vercel deploys. Check the deployment status with `gh api repos/teodor-vladconstantin/constantinBusiness/commits/$(git rev-parse HEAD)/status`.
