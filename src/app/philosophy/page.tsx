import type { Metadata } from "next";
import { Rule } from "@/components/motion";
import { PageTitle } from "@/components/section";
import { Rich } from "@/components/rich";

export const metadata: Metadata = {
  title: "Philosophy",
  description: "How I work with clients: understand the real problem, scope small, ship fast and keep the budget in view.",
};

// Draft written from the projects. The owner rewrites it in his own words.
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
      "Friction costs more than a missing feature. On Joben the ATS check is the first thing a person does with the product. Asking for an account before showing a result added friction, so I removed the login. [TODO: Duku confirms numbers and period]",
    ],
  },
  {
    title: "Keep the budget in view",
    text: [
      "Most of my projects run on a managed Postgres and one hosting platform. The client pays for little infrastructure and has little to maintain. [TODO: Duku confirms and adds one budget example]",
    ],
  },
];

export default function Philosophy() {
  return (
    <>
      <PageTitle label="Philosophy / Draft" title="How I work with clients" />
      <div className="container-site pb-24">
        <p className="label mb-4 border border-line px-2 py-1">Draft for Duku to rewrite in his own voice.</p>
        <div className="max-w-[720px]">
          <p className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-[1.05] tracking-[-0.03em]">Judgment of humans. Speed of AI.</p>
          <p className="prose-site mt-3">
            AI makes me faster at debugging and implementation. I decide the flows and the structure of the system and explain them clearly to the AI, because code written without that guidance works inside a system that makes no sense.
          </p>
          <p className="prose-site mt-2 text-muted">
            <Rich text="The shape of this idea owes something to fastforward.dev. [TODO: Duku decides whether to keep this line]" />
          </p>

          {points.map((p, i) => (
            <section key={p.title} className="pt-12">
              <Rule />
              <p className="label pt-3">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="title mb-2 mt-1">{p.title}</h2>
              <div className="grid gap-2">
                {p.text.map((t) => (
                  <p key={t} className="prose-site">
                    <Rich text={t} />
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
