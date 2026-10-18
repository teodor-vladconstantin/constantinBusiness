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
