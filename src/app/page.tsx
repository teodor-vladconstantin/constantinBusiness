import Link from "next/link";
import { Reveal } from "@/components/motion";
import { Section } from "@/components/section";
import { Spine } from "@/components/spine";
import { ProjectTable } from "@/components/project-table";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <>
      <Spine />
      <section className="container-site pb-16 pt-12 md:pt-24">
        <p className="label mb-2">{site.name}</p>
        <h1 className="display">
          <Reveal>Intro sentence arrives in Step 3.</Reveal>
        </h1>
      </section>
      <Section n="01" title="Projects">
        <ProjectTable />
      </Section>
      <Section n="02" title="How I build">
        <Link href="/principles" className="label !text-accent">
          Principles
        </Link>
      </Section>
      <Section n="03" title="Contact">
        <ul className="flex gap-3">
          <li>
            <a className="label hover:!text-fg" href={site.linkedin} rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          {site.github && (
            <li>
              <a className="label hover:!text-fg" href={site.github} rel="noopener noreferrer">
                GitHub
              </a>
            </li>
          )}
        </ul>
      </Section>
    </>
  );
}
