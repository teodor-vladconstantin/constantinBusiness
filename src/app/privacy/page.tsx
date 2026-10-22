import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What personal data this site collects, why, who processes it and how to exercise your rights.",
};

const email = site.emails[0];

const sections = [
  {
    title: "Who is responsible",
    text: [
      `${site.name}, an independent developer based in Romania, runs this site and decides how data is used. This makes me the controller under the GDPR.`,
      `Contact for any privacy question: ${email}.`,
    ],
  },
  {
    title: "What I collect",
    text: [
      "Contact form: your name, your email address and your message. I also record the time of submission.",
      "Spam check: the form uses Cloudflare Turnstile. Your browser sends the check result and your IP address to Cloudflare, and my server sends the same token and IP to Cloudflare to confirm it. I do not store your IP address.",
      "Visits: the site uses Vercel Web Analytics for page view counts. It sets no cookies and builds no profile of a visitor.",
      "Hosting: Vercel serves the site and keeps technical request logs such as IP address and user agent for security and operation.",
    ],
  },
  {
    title: "Why and on what basis",
    text: [
      "I use your name, email and message to read and answer your enquiry. The basis is my legitimate interest in replying to people who write to me, and steps you ask for before a contract (GDPR Art. 6(1)(f) and 6(1)(b)).",
      "I use the spam check and the analytics to keep the form working and to see which pages are read. The basis is my legitimate interest in running a secure site (Art. 6(1)(f)).",
    ],
  },
  {
    title: "Who receives the data",
    text: [
      "Supabase stores contact messages in a database. Only I can read them, through a private login.",
      "Cloudflare runs the spam check. Vercel hosts the site and runs the analytics.",
      "These providers act as processors for me and may handle data outside the European Economic Area under standard contractual clauses. I do not sell your data and I do not share it for advertising.",
    ],
  },
  {
    title: "How long I keep it",
    text: [
      "I keep a message while we talk and delete it when the conversation ends. I delete any message no later than 24 months after I received it.",
      "Analytics and hosting logs follow the retention periods of Vercel.",
    ],
  },
  {
    title: "Cookies",
    text: [
      "Visitors receive no tracking or advertising cookies. The only cookie belongs to the private admin login, and it is set only after I sign in.",
      "Cloudflare Turnstile may store technical data in your browser to run the check.",
    ],
  },
  {
    title: "Your rights",
    text: [
      `You can ask me to show you your data, correct it, delete it, restrict its use, hand it to you in a portable format, or stop using it where I rely on legitimate interest. Write to ${email}. I answer within one month.`,
      "You can also complain to the Romanian data protection authority, ANSPDCP (dataprotection.ro), or to the authority in your own country.",
    ],
  },
  {
    title: "Changes",
    text: ["I update this page when the site collects something new. The date at the top shows the latest version."],
  },
];

export default function Privacy() {
  return <LegalPage label="Legal" title="Privacy policy" updated="23 October 2026" sections={sections} />;
}
