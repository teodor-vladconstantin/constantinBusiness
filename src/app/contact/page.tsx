import type { Metadata } from "next";
import { PageTitle, Section } from "@/components/section";
import { site } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  return (
    <>
      <PageTitle label="Contact" title="Contact" />
      <Section n="01" title="Write to me">
        <p className="prose-site mb-3">Send a short description of the problem and the budget range.</p>
        <ContactForm />
        <p className="label mt-4">Or by email</p>
        <ul className="mt-1 grid gap-2">
          {site.emails.map((e, i) => (
            <li key={e}>
              <a className={`underline underline-offset-4 ${i === 0 ? "!text-accent" : ""}`} href={`mailto:${e}`}>
                {e}
              </a>
            </li>
          ))}
        </ul>
      </Section>
      <Section n="02" title="Elsewhere">
        <ul className="grid gap-2">
          <li>
            <a className="underline underline-offset-4" href={site.linkedin} rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a className="underline underline-offset-4" href={site.github} rel="noopener noreferrer">
              GitHub
            </a>
          </li>
        </ul>
      </Section>
    </>
  );
}
