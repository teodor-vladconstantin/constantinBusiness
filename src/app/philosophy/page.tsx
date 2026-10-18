import type { Metadata } from "next";
import { Rule } from "@/components/motion";
import { PageTitle } from "@/components/section";

export const metadata: Metadata = {
  title: "How I work",
  description: "How I work with clients: understand the real problem, scope small, ship fast and keep the budget in view.",
};

const points = [
  {
    title: "Understand the real problem first",
    text: [
      "A request usually describes a feature. The business has a problem behind it. I ask how the work happens today and where it slows down.",
      "At ThinkUp, development zones and county assignments change over time. I built the county map so that when a county moves to another zone, its high schools and ambassador students move with it. The product follows how the client works.",
    ],
  },
  {
    title: "Scope small",
    text: [
      "The first version covers the one job the client needs done. On Nyra the schema separates data per organization from the first migration, and the interface serves one organization. The structure is ready for more. The first version stays simple.",
    ],
  },
  {
    title: "Ship fast",
    text: [
      "Friction costs more than a missing feature. On Joben the ATS check is the first thing a person does with the product. Asking for an account before showing a result added friction, so I removed the login.",
    ],
  },
  {
    title: "Keep the budget in view",
    text: [
      "Most of my projects run on a managed Postgres and one hosting platform. The client pays for little infrastructure and has little to maintain.",
    ],
  },
];

const steps = [
  { title: "Understand", text: "I start from the problem the business has." },
  { title: "Scope", text: "I cut the first version small enough to ship and learn from." },
  { title: "Ship", text: "I deploy it and fix what real use shows." },
];

export default function Philosophy() {
  return (
    <>
      <PageTitle label="How I work" title="How I work with clients" />
      <div className="container-site pb-16 md:pb-24">
        <div className="max-w-[720px]">
          <p className="prose-site">
            AI makes me faster at debugging and implementation. I decide the flows and the structure of the system and explain them clearly to the AI, because code written without that guidance works inside a system that makes no sense.
          </p>

          <ol className="relative mt-8 grid gap-4 md:grid-cols-3 md:gap-3" aria-label="Three steps">
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

          {points.map((p, i) => (
            <section key={p.title} className="pt-12">
              <Rule />
              <p className="label pt-3">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="title mb-2 mt-1">{p.title}</h2>
              <div className="grid gap-2">
                {p.text.map((t) => (
                  <p key={t} className="prose-site">
                    {t}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
