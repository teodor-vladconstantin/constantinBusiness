import type { Metadata } from "next";
import { PageTitle, Section } from "@/components/section";

export const metadata: Metadata = {
  title: "About",
  description: "Developer from Romania. Next.js, React, TypeScript and Supabase.",
};

export default function About() {
  return (
    <>
      <PageTitle label="About" title="About" />
      <Section n="01" title="Profile">
        <div className="prose-site grid gap-2">
          <p>Developer from Romania.</p>
          <p>I build web products with Next.js, React, TypeScript and Supabase.</p>
          <p>I take a business need from the client and ship a working product that fits the budget.</p>
          <p>I use AI to write and debug code. I decide the flows and the structure of the system.</p>
        </div>
      </Section>
      <Section n="02" title="Education">
        <p className="prose-site">Cambridge English CAE, level C2.</p>
      </Section>
    </>
  );
}
