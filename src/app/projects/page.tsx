import type { Metadata } from "next";
import { PageTitle } from "@/components/section";
import { Projects } from "@/components/projects";

export const metadata: Metadata = { title: "Projects", description: "Seven projects: an intranet, an ATS, a resume builder, a habit app, a recruitment portal, a youth platform and a shop." };

export default function ProjectsPage() {
  return (
    <>
      <PageTitle label="Projects" title="Selected work" />
      <div className="container-site pb-24">
        <Projects />
      </div>
    </>
  );
}
