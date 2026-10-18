import Link from "next/link";
import { Reveal } from "@/components/motion";
import { Spine, type SpineSection } from "@/components/spine";
import { WorkCard } from "@/components/work-card";
import { getProject } from "@/lib/projects";
import { site } from "@/lib/site";

const sections: SpineSection[] = [
  { id: "process", label: "Process" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

const steps = [
  { title: "Understand", text: "I start from the problem the business has." },
  { title: "Scope", text: "I cut the first version small enough to ship and learn from." },
  { title: "Ship", text: "I deploy it and fix what real use shows." },
];

export default function Home() {
  const featured = ["joben", "nyra"].map((s) => getProject(s)!);
  return (
    <>
      <Spine sections={sections} />
      <section className="container-site pb-16 pt-10 md:pt-16">
        <p className="label mb-3">
          {site.name} / {site.role}
        </p>
        <h1 className="display">
          <Reveal eager>Working software for small teams, shipped on budget.</Reveal>
        </h1>
        <p className="mt-4 max-w-[56ch] text-[18px] leading-snug text-muted">{site.intro}</p>
        <p className="mt-2 max-w-[56ch] text-[16px] leading-snug">
          I deliver web apps, internal tools and AI integrations as fixed-price projects of 1 to 3 weeks.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href="/contact" className="bg-accent px-2 py-1 font-mono text-[12px] uppercase tracking-[0.08em] !text-black">
            Get in touch
          </Link>
          <a href={site.github} rel="noopener noreferrer" className="label hover:!text-fg">
            GitHub ↗
          </a>
          <a href={site.linkedin} rel="noopener noreferrer" className="label hover:!text-fg">
            LinkedIn ↗
          </a>
        </div>
      </section>

      <section id="process" className="container-site pb-16 md:pb-24">
        <ol className="relative grid gap-4 md:grid-cols-3 md:gap-3" aria-label="How I work">
          <span aria-hidden className="absolute left-0 right-0 top-[3px] hidden h-px bg-line md:block" />
          {steps.map((s, i) => (
            <li key={s.title} className="relative border-t border-line pt-3 md:border-t-0">
              <span aria-hidden className={`absolute left-0 top-[-3px] block h-[7px] w-[7px] rounded-full md:top-0 ${i === steps.length - 1 ? "bg-accent" : "bg-fg"}`} />
              <p className="label !text-fg md:pt-3">
                {String(i + 1).padStart(2, "0")} {s.title}
              </p>
              <p className="mt-1 max-w-[30ch] text-[15px] leading-snug text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="work" className="container-site pb-16 md:pb-24">
        <div className="mb-4 flex items-baseline justify-between border-t border-line pt-2">
          <h2 className="label">Work I've shipped</h2>
          <Link href="/work" className="label hover:!text-fg">
            All work →
          </Link>
        </div>
        <div className="grid gap-x-3 gap-y-8 md:grid-cols-2">
          {featured.map((p, i) => (
            <WorkCard key={p.slug} p={p} priority={i === 0} />
          ))}
        </div>
      </section>

      <section id="contact" className="container-site pb-16 md:pb-24">
        <div className="border-t border-line pt-2">
          <p className="label mb-2">Contact</p>
          <a className="font-heading text-[clamp(1.25rem,5.2vw,3rem)] font-bold leading-none tracking-[-0.03em] [overflow-wrap:anywhere] underline decoration-accent underline-offset-8" href={`mailto:${site.emails[0]}`}>
            {site.emails[0]}
          </a>
          <p className="mt-3 max-w-[52ch] text-muted">Send a short description of the problem and the budget range.</p>
        </div>
      </section>
    </>
  );
}
