"use client";

import { useEffect, useRef, useState } from "react";
import { ContactForm } from "@/app/contact/contact-form";

// Mounts the form, and with it the Turnstile script, only when the section is near the viewport.
export function LazyContactForm() {
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
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref} className="min-h-[480px]">{on && <ContactForm />}</div>;
}
