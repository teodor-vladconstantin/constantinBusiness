import type { Metadata } from "next";
import { PageTitle, Section } from "@/components/section";
import { ProjectTable } from "@/components/project-table";

export const metadata: Metadata = { title: "Projects", description: "Seven projects: an intranet, an ATS, a resume builder, a habit app, a recruitment portal, a youth platform and a shop." };

export default function Projects() {
  return (
    <>
      <PageTitle label="Projects" title="Selected work" />
      <Section n="01" title="Index">
        <ProjectTable />
      </Section>
    </>
  );
}
