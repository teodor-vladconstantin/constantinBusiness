import type { Metadata } from "next";
import { PageTitle } from "@/components/section";
import { Reveal, Rule } from "@/components/motion";
import { principles, principlesTitle } from "@/lib/principles";

export const metadata: Metadata = { title: principlesTitle };

export default function Principles() {
  return (
    <>
      <PageTitle label="Principles" title={principlesTitle} />
      {principles.map((p) => (
        <section key={p.n} className="container-site pb-16">
          <Rule />
          <div className="grid-12 gap-y-3 pt-3">
            <p className="label col-span-12 md:col-span-2">{p.n}</p>
            <div className="col-span-12 md:col-span-10">
              <h2 className="font-heading text-[clamp(2rem,5vw,4rem)] font-bold leading-[1] tracking-[-0.03em]">
                <Reveal>{p.title}</Reveal>
              </h2>
              <div className="prose-site mt-3 grid gap-2">
                {p.body.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
