import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/projects";
import { TechChip } from "./tech-chip";

const hasPreview = (slug: string) => fs.existsSync(path.join(process.cwd(), "public/previews", `${slug}.png`));

// Preview, name, one line, tools, links. The card links to the case study;
// repo and live links sit above it so they stay clickable.
export function ProjectCard({ p, priority = false }: { p: Project; priority?: boolean }) {
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden border border-line bg-[#18181b]">
        {hasPreview(p.slug) ? (
          <Image
            src={`/previews/${p.slug}.png`}
            alt={`${p.name} homepage`}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 576px, 100vw"
            className="object-cover object-top transition-transform duration-[900ms] ease-site group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col justify-between p-3">
            <span className="label">{p.repo?.kind === "private" ? "Private repository" : "No public preview"}</span>
            <span className="font-heading text-[clamp(2rem,5vw,3.5rem)] font-bold leading-none tracking-[-0.03em] text-line transition-colors duration-500 group-hover:text-muted">
              {p.name}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <h3 className="font-heading text-[26px] font-bold leading-none tracking-[-0.03em]">
          <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0">
            {p.name}
          </Link>
        </h3>
        <span className="label">{p.year}</span>
      </div>
      <p className="mt-1 max-w-[46ch] text-[15px] leading-snug text-muted">{p.oneLiner}</p>

      <ul className="mt-2 flex flex-wrap gap-[6px]">
        {p.stack.map((t) => (
          <TechChip key={t} name={t} />
        ))}
      </ul>

      <div className="relative z-10 mt-2 flex gap-3 border-t border-line pt-2">
        {p.repo?.kind === "private" ? (
          <span className="label">Private repository</span>
        ) : p.repo ? (
          <a href={p.repo.url} rel="noopener noreferrer" target="_blank" className="label hover:!text-fg">
            {p.repo.label} ↗
          </a>
        ) : null}
        {p.live && (
          <a href={p.live} rel="noopener noreferrer" target="_blank" className="label hover:!text-fg">
            Live site ↗
          </a>
        )}
      </div>
    </article>
  );
}
