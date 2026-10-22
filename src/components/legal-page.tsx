import { PageTitle } from "./section";

export type LegalSection = { title: string; text: string[] };

// Shared layout for the Privacy and Terms pages.
export function LegalPage({ label, title, updated, sections }: { label: string; title: string; updated: string; sections: LegalSection[] }) {
  return (
    <>
      <PageTitle label={label} title={title} />
      <div className="container-site pb-16 md:pb-24">
        <div className="max-w-[720px]">
          <p className="label">Last updated {updated}</p>
          {sections.map((s, i) => (
            <section key={s.title} className="border-t border-line pt-3 mt-8">
              <p className="label">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="title mb-2 mt-1">{s.title}</h2>
              <div className="grid gap-2">
                {s.text.map((t) => (
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
