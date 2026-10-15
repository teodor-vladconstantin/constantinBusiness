"use client";

import { useEffect, useRef } from "react";

// Home spine: a thin line that fills with scroll progress, with an accent dot at the head.
// Section-aware active state arrives in Step 3.
export function Spine() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      ref.current?.style.setProperty("--p", String(p));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={ref} className="spine" aria-hidden>
      <div className="spine-track" />
      <div className="spine-fill" />
      <span className="spine-dot" />
    </div>
  );
}

// Case study line: problem, decision, result as three connected dots.
export function ProjectLine() {
  const steps = ["Problem", "Decision", "Result"];
  return (
    <ol className="relative grid grid-cols-3" aria-label="Problem, decision, result">
      <span aria-hidden className="absolute left-0 right-0 top-[3px] h-px bg-line" />
      {steps.map((s, i) => (
        <li key={s} className="relative pt-3">
          <span aria-hidden className={`absolute left-0 top-0 block h-[7px] w-[7px] rounded-full ${i === steps.length - 1 ? "bg-accent" : "bg-fg"}`} />
          <span className="label">{s}</span>
        </li>
      ))}
    </ol>
  );
}
