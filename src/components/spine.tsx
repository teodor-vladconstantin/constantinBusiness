"use client";

import { useEffect, useRef, useState } from "react";

export type SpineSection = { id: string; label: string };
type Mark = { top: number };

// Home spine: a thin line that fills with scroll progress. Ticks mark the sections.
// The accent dot sits on the active section and a mono label names it.
export function Spine({ sections }: { sections: SpineSection[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const measure = () => {
      const h = document.documentElement.scrollHeight;
      setMarks(
        sections.map((s) => {
          const el = document.getElementById(s.id);
          return { top: el ? (el.getBoundingClientRect().top + window.scrollY) / h : 0 };
        }),
      );
    };
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ref.current?.style.setProperty("--p", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
      let a = -1;
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) a = i;
      });
      setActive(a);
    };
    const onResize = () => {
      measure();
      update();
    };
    measure();
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [sections]);

  const dotTop = active >= 0 && marks[active] ? marks[active].top : 0;

  return (
    <>
      <div ref={ref} className="spine" aria-hidden>
        <div className="spine-track" />
        <div className="spine-fill" />
        {marks.map((m, i) => (
          <span key={i} className="spine-tick" style={{ top: `${m.top * 100}%` }} />
        ))}
        <span className="spine-dot" style={{ top: `calc(${dotTop * 100}% - 3px)` }} />
      </div>
      <p className="spine-label label" aria-hidden>
        {active >= 0 ? `${String(active + 1).padStart(2, "0")} ${sections[active].label}` : "00 Intro"}
      </p>
    </>
  );
}

// Case study line: problem, decision, result as three connected dots linking to their sections.
export function ProjectLine() {
  const steps = [
    { id: "problem", label: "Problem" },
    { id: "decision", label: "Decision" },
    { id: "result", label: "Result" },
  ];
  return (
    <ol className="relative grid grid-cols-3" aria-label="Problem, decision, result">
      <span aria-hidden className="absolute left-0 right-0 top-[3px] h-px bg-line" />
      {steps.map((s, i) => (
        <li key={s.id} className="relative pt-3">
          <span aria-hidden className={`absolute left-0 top-0 block h-[7px] w-[7px] rounded-full ${i === steps.length - 1 ? "bg-accent" : "bg-fg"}`} />
          <a href={`#${s.id}`} className="label hover:!text-fg">
            {s.label}
          </a>
        </li>
      ))}
    </ol>
  );
}
