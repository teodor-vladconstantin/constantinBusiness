"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { projects } from "@/lib/projects";

// Projects index as a table: mono number, name, year, stack.
// On desktop a small preview follows the cursor. The CSS hides it on touch screens.
export function ProjectTable() {
  const box = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const current = projects.find((p) => p.slug === hover);

  function move(e: React.MouseEvent) {
    const el = box.current;
    if (!el) return;
    const w = 288;
    const x = e.clientX + 24 + w > window.innerWidth ? e.clientX - 24 - w : e.clientX + 24;
    el.style.transform = `translate3d(${x}px, ${e.clientY + 24}px, 0)`;
  }

  return (
    <>
      <ul className="border-t border-line" onMouseMove={move} onMouseLeave={() => setHover(null)}>
        {projects.map((p, i) => (
          <li key={p.slug} className="border-b border-line">
            <Link
              href={`/projects/${p.slug}`}
              onMouseEnter={() => setHover(p.slug)}
              onFocus={() => setHover(null)}
              className="row-invert grid grid-cols-12 items-baseline gap-x-3 px-1 py-2"
            >
              <span className="label col-span-2 md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
              <span className="col-span-7 font-heading text-[22px] font-bold leading-none tracking-[-0.03em] md:col-span-4">{p.name}</span>
              <span className="label col-span-3 text-right md:col-span-2 md:text-left">{p.year}</span>
              <span className="label hidden md:col-span-5 md:block">{p.stack.slice(0, 3).join(", ")}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div ref={box} aria-hidden className="cursor-preview" data-on={current ? "true" : "false"}>
        {current && (
          <>
            <p className="label !text-fg">{current.name}</p>
            <p className="mt-1 text-[15px] leading-snug">{current.oneLiner}</p>
            <p className="label mt-1">{current.stack.join(", ")}</p>
          </>
        )}
      </div>
    </>
  );
}
