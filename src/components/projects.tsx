import fs from "node:fs";
import path from "node:path";
import { projects } from "@/lib/projects";
import { ProjectsShowcase } from "./projects-showcase";

// Server side: a preview exists when public/previews/<slug>.png does.
export function Projects() {
  const previews = projects.filter((p) => fs.existsSync(path.join(process.cwd(), "public/previews", `${p.slug}.png`))).map((p) => p.slug);
  return <ProjectsShowcase projects={projects} previews={previews} />;
}
