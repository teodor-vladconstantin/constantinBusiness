import Link from "next/link";
import { Reveal } from "@/components/motion";
import { Spine, type SpineSection } from "@/components/spine";
import { LazyContactForm } from "@/components/lazy-contact-form";
import { ProjectsRail } from "@/components/projects-rail";
import { WorkCard } from "@/components/work-card";
import { getProject, projects } from "@/lib/projects";
import { site } from "@/lib/site";

const sections: SpineSection[] = [
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

export default function Home() {
  const featured = ["joben", "nyra"].map((s) => getProject(s)!);
  const others = projects.filter((p) => !featured.includes(p));
  return (
    <>
      <Spine sections={sections} />
      <section className="container-site flex min-h-[calc(100svh-59px)] flex-col py-8">
        <div className="my-auto">
        <p className="label mb-4">
          {site.name} / {site.role}
        </p>
        <h1 className="display !text-[clamp(2.5rem,10.5vw,4.5rem)] md:!text-[clamp(2rem,5vw,4.5rem)]">
          <Reveal eager>Working software for small teams, shipped on budget.</Reveal>
        </h1>
        <p className="mt-4 text-[18px] leading-snug text-muted md:mt-3 md:text-[16px]">
          I deliver web apps, internal tools and AI integrations as fixed-price projects of 1 to 3 weeks.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 md:mt-4">
          <Link href="/contact" className="bg-accent px-3 py-[12px] font-mono text-[12px] uppercase tracking-[0.08em] !text-black md:px-2 md:py-1">
            Get in touch
          </Link>
          <a href={site.github} rel="noopener noreferrer" className="label hover:!text-fg">
            GitHub ↗
          </a>
          <a href={site.linkedin} rel="noopener noreferrer" className="label hover:!text-fg">
            LinkedIn ↗
          </a>
        </div>
        </div>
        <a href="#work" className="label self-start hover:!text-fg">
          Scroll ↓
        </a>
      </section>

      <section id="work" className="container-site py-16 md:py-24">
        <div className="mb-4 flex items-baseline justify-between border-t border-line pt-2">
          <h2 className="label">Work I've shipped</h2>
          <Link href="/work" className="label hover:!text-fg">
            All work →
          </Link>
        </div>
        <div className="grid gap-x-3 gap-y-8 md:grid-cols-2">
          {featured.map((p) => (
            <WorkCard key={p.slug} p={p} />
          ))}
        </div>

        <div className="mt-12">
          <ProjectsRail label="More projects">
            {others.map((p) => (
              <li key={p.slug} className="w-[82vw] shrink-0 snap-start sm:w-[380px] md:w-[420px]">
                <WorkCard p={p} />
              </li>
            ))}
          </ProjectsRail>
        </div>
      </section>

      <section id="contact" className="container-site py-16 md:py-24">
        <div className="border-t border-line pt-2">
          <p className="label mb-2">Contact</p>
          <a className="font-heading text-[clamp(1.25rem,5.2vw,3rem)] font-bold leading-none tracking-[-0.03em] [overflow-wrap:anywhere] underline decoration-accent underline-offset-8" href={`mailto:${site.emails[0]}`}>
            {site.emails[0]}
          </a>
          <p className="mt-3 max-w-[52ch] text-muted">Send a short description of the problem and the budget range.</p>
          <div className="mt-6">
            <LazyContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
