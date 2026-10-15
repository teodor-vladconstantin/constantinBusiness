import Link from "next/link";
import { Reveal } from "@/components/motion";
import { Section } from "@/components/section";
import { Spine, type SpineSection } from "@/components/spine";
import { ProjectTable } from "@/components/project-table";
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
      <section className="container-site pb-16 pt-12 md:pt-24">
        <p className="label mb-2">{site.name}</p>
        <h1 className="display max-w-[20ch]">
          <Reveal eager>{site.intro}</Reveal>
        </h1>
      </section>

      <Section id="projects" n="01" title="Projects">
        <ProjectTable />
      </Section>

      <Section id="principles" n="02" title="How I build">
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

      <Section id="contact" n="03" title="Contact">
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
