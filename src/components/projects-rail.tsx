"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

// Horizontal scroller with snap. The arrows scroll one card; touch and trackpad scroll natively.
export function ProjectsRail({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 320;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (step + 24), behavior: reduce ? "auto" : "smooth" });
  };

  const btn = "label border border-line px-2 py-1 hover:!text-fg disabled:opacity-30 disabled:hover:!text-muted";
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between border-t border-line pt-2">
        <p className="label">{label}</p>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous projects" className={btn} disabled={edge.start} onClick={() => go(-1)}>
            ←
          </button>
          <button type="button" aria-label="Next projects" className={btn} disabled={edge.end} onClick={() => go(1)}>
            →
          </button>
        </div>
      </div>
      <ul
        ref={ref}
        onScroll={update}
        tabIndex={0}
        aria-label={label}
        className="-mx-3 flex snap-x snap-mandatory scroll-px-3 gap-3 overflow-x-auto px-3 pb-2 md:scroll-px-0 [scrollbar-width:thin] md:mx-0 md:px-0"
      >
        {children}
      </ul>
    </div>
  );
}
