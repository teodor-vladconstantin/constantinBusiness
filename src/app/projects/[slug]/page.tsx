import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/section";
import { ProjectLine } from "@/components/spine";
import { getProject, projects } from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProject((await params).slug);
  return { title: p?.name ?? "Project" };
}

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  return (
    <div className="container-site grid-12 gap-y-6 pb-16 pt-12 md:pt-16">
      {/* Sticky left column: title, role, stack, links */}
      <aside className="col-span-12 md:col-span-4">
        <div className="md:sticky md:top-4">
          <p className="label mb-2">{project.year}</p>
          <h1 className="title mb-3">{project.name}</h1>
          <dl className="grid gap-2">
            <div>
              <dt className="label">Role</dt>
              <dd>Added in Step 3</dd>
            </div>
            <div>
              <dt className="label">Stack</dt>
              <dd>Added in Step 3</dd>
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
        <ProjectLine />
        <div className="mt-8">
          <Section n="01" title="Case study">
            <p className="prose-site text-muted">Content arrives in Step 3.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
