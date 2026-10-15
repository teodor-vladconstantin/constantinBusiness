import type { Metadata } from "next";
import { PageTitle, Section } from "@/components/section";
import { ProjectTable } from "@/components/project-table";

export const metadata: Metadata = { title: "Projects" };

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
