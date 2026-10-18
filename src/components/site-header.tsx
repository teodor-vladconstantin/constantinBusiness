"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="border-b border-line">
      <div className="container-site flex items-center justify-between gap-2 py-2">
        <Link href="/" className="shrink-0 whitespace-nowrap font-heading text-[15px] md:text-[17px] font-bold tracking-[-0.03em]">
          {site.name}
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-nowrap gap-x-[10px] md:gap-x-3">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? "page" : undefined} className={`label whitespace-nowrap py-1 !text-[10px] !tracking-[0.04em] md:!text-[12px] md:!tracking-[0.08em] ${active ? "!text-accent" : "hover:!text-fg"}`}>
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
