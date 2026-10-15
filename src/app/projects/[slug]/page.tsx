import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Rule } from "@/components/motion";
import { ProjectLine } from "@/components/spine";
import { getProject, projects } from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  return { title: p?.name ?? "Project", description: p?.oneLiner };
}

function Block({ id, n, title, children }: { id: string; n: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4 pb-12">
      <Rule />
      <p className="label pt-3">{n}</p>
      <h2 className="title mb-2 mt-1">{title}</h2>
      {children}
    </section>
  );
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <div className="container-site grid-12 gap-y-6 pb-16 pt-12 md:pt-16">
      {/* Sticky left column: title, role, stack, links */}
      <aside className="col-span-12 md:col-span-4">
        <div className="md:sticky md:top-4">
          <p className="label mb-2">{project.year}</p>
          <h1 className="title mb-2">{project.name}</h1>
          <p className="mb-3 text-muted">{project.oneLiner}</p>
          <dl className="grid gap-2">
            <div>
              <dt className="label">Role</dt>
              <dd>{project.role}</dd>
              {project.team && <dd>{project.team}</dd>}
              {project.context && <dd>{project.context}</dd>}
            </div>
            <div>
              <dt className="label">Stack</dt>
              <dd>{project.stack.join(", ")}</dd>
            </div>
            <div>
              <dt className="label">Links</dt>
              <dd className="grid gap-1">
                {project.live && (
                  <a className="underline underline-offset-4" href={project.live} rel="noopener noreferrer">
                    Live product
                  </a>
                )}
                {project.repo?.kind === "private" && <span className="text-muted">{project.repo.label}</span>}
                {project.repo && project.repo.kind !== "private" && (
                  <a className="underline underline-offset-4" href={project.repo.url} rel="noopener noreferrer">
                    {project.repo.label}
                  </a>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </aside>

      <div className="col-span-12 md:col-span-8">
        <div className="mb-8">
          <ProjectLine />
        </div>

        <Block id="problem" n="01" title="Problem">
          <p className="prose-site">{project.problem}</p>
        </Block>
        <Block id="decision" n="02" title="Decision">
          <p className="prose-site">{project.decision}</p>
        </Block>
        <Block id="result" n="03" title="Result">
          <p className="prose-site">{project.result}</p>
        </Block>

        <Block id="code" n="04" title="In the code">
          <ul className="border-t border-line">
            {project.inCode.map((c) => (
              <li key={c.text + c.path} className="border-b border-line py-2">
                <p className="prose-site">{c.text}</p>
                <p className="label mt-1 break-all">{c.path}</p>
              </li>
            ))}
          </ul>
        </Block>

        <Block id="scale" n="05" title="Scale">
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {project.scale.map((s) => (
              <li key={s} className="label !text-fg">
                {s}
              </li>
            ))}
          </ul>
        </Block>
      </div>
    </div>
  );
}
