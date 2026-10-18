import Link from "next/link";
import { Reveal } from "@/components/motion";
import { Projects } from "@/components/projects";
import { Section } from "@/components/section";
import { Spine, type SpineSection } from "@/components/spine";
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
      <section className="container-site pb-12 pt-10 md:pt-16">
        <div className="grid-12 items-end gap-y-3">
          <h1 className="display col-span-12 md:col-span-8">
            <Reveal eager>{site.name}</Reveal>
          </h1>
          <div className="col-span-12 md:col-span-4">
            <p className="label mb-1">{site.role}</p>
            <p className="text-[16px] leading-snug text-muted">{site.intro}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a href={`mailto:${site.emails[0]}`} className="bg-accent px-2 py-1 font-mono text-[12px] uppercase tracking-[0.08em] text-black">
            Get in touch
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
        <Projects />
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
