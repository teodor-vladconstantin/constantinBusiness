import type { Metadata } from "next";
import { PageTitle } from "@/components/section";
import { TechChip } from "@/components/tech-chip";
import { RepoLink, WorkCard } from "@/components/work-card";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Two case studies, Nyra and Joben, and five other projects: an intranet, a recruitment portal, a habit app, a youth platform and a shop.",
};

export default function Work() {
  const cases = projects.filter((p) => p.case);
  const others = projects.filter((p) => !p.case);
  return (
    <>
      <PageTitle label="Work" title="Selected work" />
      <section className="container-site pb-24">
        <p className="label mb-4 border-t border-line pt-2">Case studies</p>
        <div className="grid gap-x-3 gap-y-8 md:grid-cols-2">
          {cases.map((p, i) => (
            <WorkCard key={p.slug} p={p} priority={i === 0} />
          ))}
        </div>
      </section>

      <section className="container-site pb-24">
        <p className="label border-t border-line pt-2">Other projects</p>
        <ul>
          {others.map((p) => (
            <li key={p.slug} className="grid gap-x-3 gap-y-1 border-b border-line py-3 md:grid-cols-12">
              <h2 className="font-heading text-[22px] font-bold leading-none tracking-[-0.03em] md:col-span-3">{p.name}</h2>
              <div className="md:col-span-6">
                <p className="max-w-[52ch] text-[16px] leading-snug">{p.oneLiner}</p>
                <ul className="mt-2 flex flex-wrap gap-[6px]">
                  {p.stack.slice(0, 5).map((t) => (
                    <TechChip key={t} name={t} />
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap items-start gap-x-3 gap-y-1 md:col-span-3 md:justify-end">
                <RepoLink p={p} />
                {p.live && (
                  <a href={p.live} target="_blank" rel="noopener noreferrer" className="label hover:!text-fg">
                    Live site ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
