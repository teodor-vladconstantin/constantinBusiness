"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { nav, site } from "@/lib/site";
import { projects } from "@/lib/projects";

type Item = { label: string; hint: string; run: (router: ReturnType<typeof useRouter>) => void };

const items: Item[] = [
  { label: "Home", hint: "Page", run: (r) => r.push("/") },
  ...nav.map((n): Item => ({ label: n.label, hint: "Page", run: (r) => r.push(n.href) })),
  ...projects.map((p): Item => ({ label: p.name, hint: "Project", run: (r) => r.push(`/projects/${p.slug}`) })),
  { label: "LinkedIn", hint: "External", run: () => window.open(site.linkedin, "_blank", "noopener,noreferrer") },
  { label: "GitHub", hint: "External", run: () => window.open(site.github, "_blank", "noopener,noreferrer") },
];

// Cmd+K or Ctrl+K opens a navigation palette.
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const list = useMemo(() => items.filter((i) => i.label.toLowerCase().includes(q.trim().toLowerCase())), [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      input.current?.focus();
    }
  }, [open]);

  function choose(i: Item | undefined) {
    if (!i) return;
    setOpen(false);
    i.run(router);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-3 pt-[12vh]" onMouseDown={() => setOpen(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-[560px] border border-line bg-bg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <input
          ref={input}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((s) => Math.min(list.length - 1, s + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((s) => Math.max(0, s - 1));
            } else if (e.key === "Enter") {
              choose(list[sel]);
            }
          }}
          placeholder="Go to"
          aria-label="Search pages and projects"
          className="w-full border-b border-line bg-transparent p-2 outline-none"
        />
        <ul className="max-h-[50vh] overflow-auto">
          {list.length === 0 && <li className="label p-2">No match</li>}
          {list.map((i, idx) => (
            <li key={i.hint + i.label}>
              <button
                type="button"
                onMouseEnter={() => setSel(idx)}
                onClick={() => choose(i)}
                className={`flex w-full items-baseline justify-between p-2 text-left ${idx === sel ? "bg-accent text-black" : ""}`}
              >
                <span>{i.label}</span>
                <span className={`label ${idx === sel ? "!text-black" : ""}`}>{i.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
