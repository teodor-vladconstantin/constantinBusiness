import type { Metadata } from "next";
import { PageTitle, Section } from "@/components/section";

export const metadata: Metadata = { title: "How I build" };

export default function Principles() {
  return (
    <>
      <PageTitle label="Principles" title="How I build" />
      {["01", "02", "03"].map((n) => (
        <Section key={n} n={n} title="Principle">
          <p className="prose-site text-muted">Approved text arrives in Step 3.</p>
        </Section>
      ))}
    </>
  );
}
