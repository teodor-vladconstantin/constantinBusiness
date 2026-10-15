"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Sets data-inview="true" once the element enters the viewport.
// The CSS in globals.css does the animation, so JS stays at one observer.
export function InView({ children, className = "", threshold = 0.2 }: { children?: ReactNode; className?: string; threshold?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} data-inview={on} className={className}>
      {children}
    </div>
  );
}

// Title reveal: text slides up inside an overflow mask.
// `eager` is for titles above the fold: pure CSS, so it runs before hydration.
export function Reveal({ children, eager = false }: { children: ReactNode; eager?: boolean }) {
  if (eager) {
    return (
      <span className="reveal-mask">
        <span className="reveal-eager">{children}</span>
      </span>
    );
  }
  return (
    <InView>
      <span className="reveal-mask">
        <span>{children}</span>
      </span>
    </InView>
  );
}

// 1px line drawn with scaleX.
export function Rule({ className = "" }: { className?: string }) {
  return (
    <InView className={className} threshold={0}>
      <div className="rule" />
    </InView>
  );
}

// clip-path wipe for images and blocks.
export function Wipe({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <InView className={className}>
      <div className="wipe">{children}</div>
    </InView>
  );
}
