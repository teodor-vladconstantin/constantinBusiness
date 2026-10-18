import type { Metadata } from "next";
import { PageTitle } from "@/components/section";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/lib/projects";

export const metadata: Metadata = { title: "Projects", description: "Seven projects: an intranet, an ATS, a resume builder, a habit app, a recruitment portal, a youth platform and a shop." };

export default function Projects() {
  return (
    <>
      <PageTitle label="Projects" title="Selected work" />
      <div className="container-site grid gap-x-3 gap-y-8 pb-24 md:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.slug} p={p} />
        ))}
      </div>
    </>
  );
}
