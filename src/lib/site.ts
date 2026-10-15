export const site = {
  name: "Duku Constantin",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  linkedin: "https://www.linkedin.com/in/dukuconstantin",
  // Empty until the owner confirms the value. Components render a link only when set.
  github: "",
  email: "",
};

export const nav = [
  { href: "/projects", label: "Projects" },
  { href: "/principles", label: "Principles" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;
