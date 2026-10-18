import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Rule } from "@/components/motion";
import { ProjectLine } from "@/components/spine";
import { TechChip } from "@/components/tech-chip";
import { RepoLink } from "@/components/work-card";
import { getCase } from "@/lib/cases";
import { getProject, liveHost, projects } from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  return { title: `${p?.name ?? "Project"}${getCase(slug) ? " case study" : ""}`, description: p?.oneLiner };
}

type Block = { id: string; title: string; paragraphs?: string[]; list?: { text: string; path?: string }[]; chips?: string[] };

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const study = getCase(slug);

  const blocks: Block[] = study
    ? [
        { id: "problem", title: "Problem", paragraphs: study.problem },
        { id: "missing", title: "What was missing", paragraphs: study.missing },
        { id: "investigation", title: "How I investigated", paragraphs: study.investigation },
        { id: "decision", title: "What I built", paragraphs: study.decision },
        { id: "result", title: "Result", paragraphs: study.result },
      ]
    : [
        { id: "problem", title: "Problem", paragraphs: [project.problem] },
        { id: "decision", title: "What I built", paragraphs: [project.decision] },
        { id: "result", title: "Result", paragraphs: [project.result] },
        { id: "code", title: "In the code", list: project.inCode },
        { id: "scale", title: "Size", chips: project.scale },
      ];

  const meta = [
    { k: "Role", v: project.role },
    project.team && { k: "Team", v: project.team },
    project.context && { k: "Context", v: project.context },
  ].filter(Boolean) as { k: string; v: string }[];

  return (
    <article className="container-site pb-16 pt-10 md:pb-24 md:pt-16">
      <p className="label mb-2">
        {study ? "Case study" : "Project"} / {project.year}
      </p>
      <h1 className="display">{project.name}</h1>
      {study?.summary ? (
        <div className="mt-3 grid max-w-[56ch] gap-1 text-[18px] leading-snug">
          {study.summary.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      ) : (
        <p className="mt-3 max-w-[52ch] text-[18px] leading-snug text-muted">{project.oneLiner}</p>
      )}

      <dl className="mt-4 grid max-w-[720px] gap-2">
        {meta.map((m) => (
          <div key={m.k} className="grid gap-x-3 md:grid-cols-[96px_1fr]">
            <dt className="label">{m.k}</dt>
            <dd>{m.v}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-3 flex flex-wrap gap-[6px]">
        {project.stack.map((t) => (
          <TechChip key={t} name={t} />
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        <RepoLink p={project} />
        {project.live && (
          <a href={project.live} target="_blank" rel="noopener noreferrer" className="label hover:!text-fg">
            {liveHost(project.live)} ↗
          </a>
        )}
        {project.internal && <span className="label">Internal tool</span>}
      </div>

      {project.preview && (
        <div className="relative mt-6 aspect-[16/10] overflow-hidden border border-line">
          <Image src={`/previews/${project.preview}`} alt={`${project.name} homepage`} fill priority sizes="(min-width: 1248px) 1200px, 100vw" className="object-cover object-top" />
        </div>
      )}

      <div className="mt-8 max-w-[720px]">
        <ProjectLine steps={blocks.map((b) => ({ id: b.id, label: b.title }))} />
        {blocks.map((b, i) => (
          <section key={b.id} id={b.id} className="scroll-mt-4 pt-12">
            <Rule />
            <p className="label pt-3">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="title mb-2 mt-1">{b.title}</h2>
            {b.paragraphs && (
              <div className="grid gap-2">
                {b.paragraphs.map((t) => (
                  <p key={t} className="prose-site">
                    {t}
                  </p>
                ))}
              </div>
            )}
            {b.id === "decision" && study?.technical && (
              <details className="group mt-3 border border-line">
                <summary className="label cursor-pointer list-none px-2 py-1 hover:!text-fg">
                  <span className="group-open:hidden">+ </span>
                  <span className="hidden group-open:inline">- </span>Technical details
                </summary>
                <div className="grid gap-2 border-t border-line p-2">
                  {study.technical.map((t) => (
                    <p key={t} className="prose-site">
                      {t}
                    </p>
                  ))}
                </div>
              </details>
            )}
            {b.list && (
              <ul className="border-t border-line">
                {b.list.map((c) => (
                  <li key={c.text + c.path} className="border-b border-line py-2">
                    <p className="prose-site">{c.text}</p>
                    {c.path && <p className="label mt-1 break-all">{c.path}</p>}
                  </li>
                ))}
              </ul>
            )}
            {b.chips && (
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                {b.chips.map((s) => (
                  <li key={s} className="label !text-fg">
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="mt-12 border-t border-line pt-3">
        <Link href="/work" className="label hover:!text-fg">
          ← All work
        </Link>
      </p>
    </article>
  );
}
