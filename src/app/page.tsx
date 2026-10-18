import Link from "next/link";
import { Reveal } from "@/components/motion";
import { ProjectCard } from "@/components/project-card";
import { Section } from "@/components/section";
import { Spine, type SpineSection } from "@/components/spine";
import { projects } from "@/lib/projects";
import { principles } from "@/lib/principles";
import { site } from "@/lib/site";

const sections: SpineSection[] = [
  { id: "projects", label: "Projects" },
  { id: "principles", label: "How I build" },
  { id: "contact", label: "Contact" },
];

export default function Home() {
  return (
    <>
      <Spine sections={sections} />
      <section className="container-site pb-24 pt-16 md:pt-32">
        <p className="label mb-3">{site.role}</p>
        <h1 className="display max-w-[18ch]">
          <Reveal eager>{site.name}</Reveal>
        </h1>
        <p className="mt-4 max-w-[52ch] text-[19px] leading-snug text-muted">{site.intro}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a href="#projects" className="bg-accent px-3 py-[12px] font-mono text-[12px] uppercase tracking-[0.08em] text-black">
            See the work
          </a>
          <a href={site.github} rel="noopener noreferrer" className="label hover:!text-fg">
            GitHub ↗
          </a>
          <a href={site.linkedin} rel="noopener noreferrer" className="label hover:!text-fg">
            LinkedIn ↗
          </a>
        </div>
      </section>

      <section id="projects" className="container-site pb-24">
        <div className="mb-4 flex items-baseline justify-between border-t border-line pt-2">
          <h2 className="label">Selected work</h2>
          <span className="label">{String(projects.length).padStart(2, "0")}</span>
        </div>
        <div className="grid gap-x-3 gap-y-8 md:grid-cols-2">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} p={p} priority={i < 2} />
          ))}
        </div>
      </section>

      <Section id="principles" n="01" title="How I build">
        <ol className="border-t border-line">
          {principles.map((p) => (
            <li key={p.n} className="border-b border-line">
              <Link href="/principles" className="row-invert grid grid-cols-12 gap-x-3 px-1 py-2">
                <span className="label col-span-2">{p.n}</span>
                <span className="col-span-10">{p.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="contact" n="02" title="Contact">
        <ul className="grid gap-2">
          <li>
            <a className="!text-accent underline underline-offset-4" href={`mailto:${site.emails[0]}`}>
              {site.emails[0]}
            </a>
          </li>
          <li>
            <a className="underline underline-offset-4" href={site.linkedin} rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a className="underline underline-offset-4" href={site.github} rel="noopener noreferrer">
              GitHub
            </a>
          </li>
        </ul>
      </Section>
    </>
  );
}
