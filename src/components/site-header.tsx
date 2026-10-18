"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="border-b border-line">
      <div className="container-site flex flex-col gap-1 py-2 md:flex-row md:items-center md:justify-between md:gap-2">
        <Link href="/" className="shrink-0 whitespace-nowrap font-heading text-[17px] font-bold tracking-[-0.03em]">
          {site.name}
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-nowrap justify-between md:gap-x-3">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? "page" : undefined} className={`label whitespace-nowrap py-1 md:!tracking-[0.08em] ${active ? "!text-accent" : "hover:!text-fg"}`}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
