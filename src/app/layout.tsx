import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PaletteLazy } from "@/components/palette-lazy";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/lib/site";
import "./globals.css";

// next/font reads these options at build time, so they must be literals.
const poppins = Poppins({ subsets: ["latin", "latin-ext"], weight: "700", variable: "--font-poppins", display: "swap" });
const inter = Inter({ subsets: ["latin", "latin-ext"], weight: ["400", "700"], variable: "--font-inter", display: "swap", preload: false });
const mono = JetBrains_Mono({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-jetbrains", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: "Independent forward deployed engineer. I understand the problem, turn the business need into working software and ship it at the client's budget.",
  openGraph: { siteName: site.name, type: "website" },
  twitter: { card: "summary_large_image" },
  alternates: { types: { "application/rss+xml": "/blog/rss.xml" } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="label absolute left-1 top-1 z-50 -translate-y-[200%] bg-bg p-1 focus:translate-y-0">
          Skip to content
        </a>
        <SmoothScroll />
        <PaletteLazy />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
