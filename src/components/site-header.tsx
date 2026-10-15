"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="border-b border-line">
      <div className="container-site flex items-center justify-between gap-3 py-2">
        <Link href="/" className="whitespace-nowrap font-heading text-[17px] font-bold tracking-[-0.03em]">
          {site.name}
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? "page" : undefined} className={`label py-1 ${active ? "!text-accent" : "hover:!text-fg"}`}>
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
