import type { ReactNode } from "react";
import { Reveal, Rule } from "./motion";

// Section header pattern: mono number, 1px rule above, title left, content right.
export function Section({ n, title, children, id }: { n: string; title: string; children?: ReactNode; id?: string }) {
  return (
    <section id={id} className="container-site pb-16">
      <Rule />
      <div className="grid-12 gap-y-4 pt-3">
        <div className="col-span-12 md:col-span-4">
          <p className="label mb-1">{n}</p>
          <h2 className="title">
            <Reveal>{title}</Reveal>
          </h2>
        </div>
        <div className="col-span-12 md:col-span-8">{children}</div>
      </div>
    </section>
  );
}

// Page-level title block used at the top of inner pages.
export function PageTitle({ label, title }: { label: string; title: string }) {
  return (
    <header className="container-site pb-8 pt-12 md:pt-16">
      <p className="label mb-2">{label}</p>
      <h1 className="display">
        <Reveal>{title}</Reveal>
      </h1>
    </header>
  );
}
