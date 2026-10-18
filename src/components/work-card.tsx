import Image from "next/image";
import Link from "next/link";
import { liveHost, type Project } from "@/lib/projects";
import { TechChip } from "./tech-chip";

// Featured project: preview, name, one line, tools, links. The title link covers the card.
export function WorkCard({ p, priority = false, as: Heading = "h3" }: { p: Project; priority?: boolean; as?: "h2" | "h3" }) {
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[16/9] overflow-hidden border border-line bg-[#18181b]">
        {p.preview ? (
          <Image
            src={`/previews/${p.preview}`}
            alt={`${p.name} homepage`}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 576px, 100vw"
            quality={70}
            className="object-cover object-top transition-transform duration-[900ms] ease-site group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col justify-between p-3">
            <span className="label">{p.internal ? "Internal tool" : p.repo?.kind === "private" ? "Private repository" : "No public preview"}</span>
            <span className="font-heading text-[clamp(2rem,5vw,3.5rem)] font-bold leading-none tracking-[-0.03em] text-line">{p.name}</span>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <Heading className="font-heading text-[26px] font-bold leading-none tracking-[-0.03em]">
          <Link href={`/work/${p.slug}`} className="after:absolute after:inset-0">
            {p.name}
          </Link>
        </Heading>
        <span className="label">{p.year}</span>
      </div>
      <p className="mt-1 max-w-[46ch] text-[15px] leading-snug text-muted">{p.oneLiner}</p>
      <ul className="mt-2 flex flex-wrap gap-[6px]">
        {p.stack.map((t) => (
          <TechChip key={t} name={t} />
        ))}
      </ul>
      <div className="relative z-10 mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-line pt-2">
        <Link href={`/work/${p.slug}`} className="label !text-fg">
          Case study →
        </Link>
        <RepoLink p={p} />
        {p.live && (
          <a href={p.live} target="_blank" rel="noopener noreferrer" className="label hover:!text-fg">
            {liveHost(p.live)} ↗
          </a>
        )}
      </div>
    </article>
  );
}

export function RepoLink({ p }: { p: Project }) {
  if (!p.repo) return null;
  if (p.repo.kind === "private") return <span className="label">Private repository</span>;
  return (
    <a href={p.repo.url} target="_blank" rel="noopener noreferrer" className="label hover:!text-fg">
      {p.repo.label} ↗
    </a>
  );
}
