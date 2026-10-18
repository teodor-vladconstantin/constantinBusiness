"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/lib/projects";
import { TechChip } from "./tech-chip";

const host = (p: Project) => (p.live ? new URL(p.live).host : p.repo?.kind === "private" ? "private repository" : "no live site");

// Index on the left, preview stage on the right (sticky). Hover or focus picks the project.
// On phones every row is open and shows its own image.
export function ProjectsShowcase({ projects, previews }: { projects: Project[]; previews: string[] }) {
  const [active, setActive] = useState(() => Math.max(0, projects.findIndex((p) => previews.includes(p.slug))));
  const has = (slug: string) => previews.includes(slug);

  return (
    <div className="grid-12 gap-y-6">
      <ul className="col-span-12 md:col-span-6">
        {projects.map((p, i) => {
          const open = i === active;
          return (
            <li
              key={p.slug}
              data-open={open}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="group border-t border-line py-2 last:border-b"
            >
              <div className="flex items-baseline gap-2">
                <span className="label w-3">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-heading text-[clamp(28px,3.4vw,44px)] font-bold leading-none tracking-[-0.03em]">
                  <Link
                    href={`/projects/${p.slug}`}
                    className="transition-colors duration-500 ease-site md:group-data-[open=false]:!text-muted"
                  >
                    {p.name}
                  </Link>
                </h3>
                <span className="label ml-auto">{p.year}</span>
              </div>

              <div className="grid transition-[grid-template-rows] duration-500 ease-site md:group-data-[open=false]:grid-rows-[0fr] grid-rows-[1fr] md:group-data-[open=true]:grid-rows-[1fr]">
                <div className="overflow-hidden md:group-data-[open=false]:invisible">
                  <div className="pl-[calc(24px+16px)] pt-2">
                    {has(p.slug) && (
                      <div className="relative mb-2 aspect-[16/10] overflow-hidden border border-line md:hidden">
                        <Image src={`/previews/${p.slug}.png`} alt={`${p.name} homepage`} fill sizes="100vw" className="object-cover object-top" />
                      </div>
                    )}
                    <p className="max-w-[46ch] text-[15px] leading-snug text-muted">{p.oneLiner}</p>
                    <ul className="mt-2 flex flex-wrap gap-[6px]">
                      {p.stack.map((t) => (
                        <TechChip key={t} name={t} />
                      ))}
                    </ul>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 pb-1">
                      {p.repo?.kind === "private" ? (
                        <span className="label">Private repository</span>
                      ) : p.repo ? (
                        <a href={p.repo.url} target="_blank" rel="noopener noreferrer" className="label !text-fg underline underline-offset-4">
                          {p.repo.label} ↗
                        </a>
                      ) : null}
                      {p.live && (
                        <a href={p.live} target="_blank" rel="noopener noreferrer" className="label !text-fg underline underline-offset-4">
                          Live site ↗
                        </a>
                      )}
                      <Link href={`/projects/${p.slug}`} className="label !text-fg underline underline-offset-4">
                        Case study →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="relative col-span-6 hidden md:block">
        <div className="sticky top-[88px] border border-line bg-[#18181b]">
          <div className="flex items-center justify-between border-b border-line px-2 py-1">
            <span className="label">{host(projects[active])}</span>
            <span className="label">
              {String(active + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
            </span>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden">
            {projects.map((p, i) => (
              <div
                key={p.slug}
                aria-hidden={i !== active}
                className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-site ${i === active ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`}
              >
                {has(p.slug) ? (
                  <Image src={`/previews/${p.slug}.png`} alt={`${p.name} homepage`} fill priority={i === 0} sizes="600px" className="object-cover object-top" />
                ) : (
                  <div className="flex h-full flex-col justify-between p-3">
                    <span className="label">No public preview</span>
                    <span className="font-heading text-[clamp(2rem,5vw,3.5rem)] font-bold leading-none tracking-[-0.03em] text-line">{p.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
