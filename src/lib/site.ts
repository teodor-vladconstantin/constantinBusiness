export const site = {
  name: "Duku Constantin",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  linkedin: "https://www.linkedin.com/in/dukuconstantin",
  github: "https://github.com/teodor-vladconstantin",
  emails: ["duku.constantin@gmail.com", "duku@joben.eu"],
  intro:
    "I understand a client's problem and turn the business need into a solution that fits their budget, without enterprise rigidity.",
};

export const nav = [
  { href: "/projects", label: "Projects" },
  { href: "/principles", label: "Principles" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;
