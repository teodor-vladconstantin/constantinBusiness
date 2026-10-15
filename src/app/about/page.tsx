import type { Metadata } from "next";
import { PageTitle, Section } from "@/components/section";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <>
      <PageTitle label="About" title="About" />
      <Section n="01" title="Profile">
        <p className="prose-site text-muted">Content arrives in Step 3.</p>
      </Section>
      <Section n="02" title="Education">
        <p className="prose-site text-muted">Content arrives in Step 3.</p>
      </Section>
    </>
  );
}
