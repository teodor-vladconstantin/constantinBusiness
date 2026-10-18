// The domain is undecided (dukuconstantin.com or a free .tech). Change it here only.
const domain = "dukuconstantin.com";

export const site = {
  name: "Duku Constantin",
  domain,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.NODE_ENV === "production" ? `https://${domain}` : "http://localhost:3000"),
  role: "Independent forward deployed engineer",
  linkedin: "https://www.linkedin.com/in/dukuconstantin",
  github: "https://github.com/teodor-vladconstantin",
  emails: ["duku.constantin@gmail.com", "duku@joben.eu"],
  intro:
    "I work with founders and small teams. I understand the problem, turn the business need into working software and ship it at the client's budget, without enterprise overhead.",
};

export const nav = [
  { href: "/work", label: "Work" },
  { href: "/philosophy", label: "How I work" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;
