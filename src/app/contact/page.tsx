import type { Metadata } from "next";
import { PageTitle, Section } from "@/components/section";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  return (
    <>
      <PageTitle label="Contact" title="Contact" />
      <Section n="01" title="Links">
        <ul className="grid gap-2">
          {site.email && (
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
          )}
          <li>
            <a href={site.linkedin} rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          {site.github && (
            <li>
              <a href={site.github} rel="noopener noreferrer">
                GitHub
              </a>
            </li>
          )}
        </ul>
      </Section>
    </>
  );
}
