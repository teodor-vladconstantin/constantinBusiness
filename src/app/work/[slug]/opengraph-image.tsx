import { ogSize, renderOg } from "@/lib/og";
import { getProject, projects } from "@/lib/projects";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Case study";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  return renderOg({ label: `Project ${p?.year ?? ""}`.trim(), title: p?.name ?? "Case study" });
}
