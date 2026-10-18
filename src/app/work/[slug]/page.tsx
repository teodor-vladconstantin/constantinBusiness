import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Rule } from "@/components/motion";
import { Rich } from "@/components/rich";
import { ProjectLine } from "@/components/spine";
import { TechChip } from "@/components/tech-chip";
import { RepoLink } from "@/components/work-card";
import { cases, getCase } from "@/lib/cases";
import { getProject } from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  return { title: `${p?.name ?? "Case study"} case study`, description: p?.oneLiner };
}

const blocks = [
  { id: "problem", title: "The problem", key: "problem" },
  { id: "missing", title: "What was broken or missing", key: "missing" },
  { id: "investigation", title: "How I investigated", key: "investigation" },
  { id: "decision", title: "What I built and decided", key: "decision" },
  { id: "result", title: "Result", key: "result" },
] as const;

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  const study = getCase(slug);
  if (!project || !study) notFound();

  return (
    <article className="container-site pb-24 pt-10 md:pt-16">
      <p className="label mb-2">Case study / {project.year}</p>
      <h1 className="display">{project.name}</h1>
      <p className="mt-3 max-w-[52ch] text-[18px] leading-snug text-muted">{project.oneLiner}</p>
      {study.note && <p className="label mt-3 border border-line px-2 py-1">{study.note}</p>}

      <ul className="mt-3 flex flex-wrap gap-[6px]">
        {project.stack.map((t) => (
          <TechChip key={t} name={t} />
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        <RepoLink p={project} />
        {project.live && (
          <a href={project.live} target="_blank" rel="noopener noreferrer" className="label hover:!text-fg">
            Live site ↗
          </a>
        )}
      </div>

      {project.preview && (
        <div className="relative mt-6 aspect-[16/10] overflow-hidden border border-line">
          <Image src={`/previews/${project.preview}`} alt={`${project.name} homepage`} fill priority sizes="(min-width: 1248px) 1200px, 100vw" className="object-cover object-top" />
        </div>
      )}

      <div className="mt-8 max-w-[720px]">
        <ProjectLine />
        {blocks.map((b, i) => (
          <section key={b.id} id={b.id} className="scroll-mt-4 pt-12">
            <Rule />
            <p className="label pt-3">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="title mb-2 mt-1">{b.title}</h2>
            <div className="grid gap-2">
              {study[b.key].map((t) => (
                <p key={t} className="prose-site">
                  <Rich text={t} />
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
