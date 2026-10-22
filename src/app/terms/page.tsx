import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using this site.",
};

const email = site.emails[0];

const sections = [
  {
    title: "About this site",
    text: [
      `${site.domain} is the personal site of ${site.name}, an independent developer based in Romania. It presents my work and lets you contact me.`,
      "Using the site means you accept these terms.",
    ],
  },
  {
    title: "No offer and no contract",
    text: [
      "The site gives information. Nothing here is a binding offer. Any project with a client starts with a written agreement that covers scope, price and delivery.",
    ],
  },
  {
    title: "Content and ownership",
    text: [
      "The text, design and code of this site belong to me unless a page says otherwise. You may quote short parts with a link back to the source.",
      "Project names and logos belong to their owners. Case studies describe my own part in the work and carry no client confidential data.",
    ],
  },
  {
    title: "Contact form",
    text: [
      "Send only information you are free to share. Do not send passwords, payment details or other sensitive data through the form.",
      "A message does not create a client relationship. I reply when I can, with no guaranteed response time.",
    ],
  },
  {
    title: "Accuracy and liability",
    text: [
      "I aim to keep the content correct and current. The site is provided as it is, and I do not guarantee that it is always available or free of errors.",
      "To the extent the law allows, I am not liable for loss that comes from using the site or from relying on its content. Rights you hold as a consumer under mandatory law stay in place.",
    ],
  },
  {
    title: "External links",
    text: ["The site links to GitHub, LinkedIn and other sites. I do not control them and I am not responsible for their content or their privacy practices."],
  },
  {
    title: "Governing law",
    text: ["Romanian law applies to these terms. Courts in Romania have jurisdiction, subject to any mandatory consumer rules that give you a different forum."],
  },
  {
    title: "Contact",
    text: [`Questions about these terms: ${email}. Personal data is covered in the privacy policy.`],
  },
];

export default function Terms() {
  return <LegalPage label="Legal" title="Terms of use" updated="23 October 2026" sections={sections} />;
}
