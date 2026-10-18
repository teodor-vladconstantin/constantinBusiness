import { ogSize, renderOg } from "@/lib/og";
import { getProject, getProjects } from "@/lib/projects-db";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Case study";

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProject(slug);
  return renderOg({ label: `Project ${p?.year ?? ""}`.trim(), title: p?.name ?? "Case study" });
}
