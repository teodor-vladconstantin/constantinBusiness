import { ogSize, renderOg } from "@/lib/og";
import { cases } from "@/lib/cases";
import { getProject } from "@/lib/projects";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Case study";

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  return renderOg({ label: `Case study ${p?.year ?? ""}`.trim(), title: p?.name ?? "Case study" });
}
