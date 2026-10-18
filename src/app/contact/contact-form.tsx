"use client";

import Script from "next/script";
import { useActionState, useEffect, useRef } from "react";
import { sendMessage, type ContactState } from "./actions";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const initial: ContactState = { ok: false };

const input = "w-full border border-line bg-transparent px-2 py-1 text-[16px] text-fg outline-none focus:border-fg";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, initial);
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);

  const mount = () => {
    if (!box.current || widget.current !== undefined || !window.turnstile) return;
    widget.current = window.turnstile.render(box.current, { sitekey: SITE_KEY, action: "contact", theme: "dark" });
  };

  // The token is single use, so ask for a new one after a failed submit.
  useEffect(() => {
    if (state.error) window.turnstile?.reset(widget.current);
  }, [state]);

  if (state.ok) {
    return <p className="prose-site">Thank you. Your message is sent. I reply by email.</p>;
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={mount} />
      <form action={action} className="grid max-w-[560px] gap-3" noValidate>
        <label className="grid gap-1">
          <span className="label">Name</span>
          <input name="name" type="text" required maxLength={100} autoComplete="name" defaultValue={state.values?.name} className={input} />
        </label>
        <label className="grid gap-1">
          <span className="label">Email</span>
          <input name="email" type="email" required maxLength={254} autoComplete="email" defaultValue={state.values?.email} className={input} />
        </label>
        <label className="grid gap-1">
          <span className="label">Message</span>
          <textarea name="message" required minLength={10} maxLength={5000} rows={6} defaultValue={state.values?.message} className={input} />
        </label>
        {/* Honeypot: hidden from people and from assistive tech. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div ref={box} />
        {state.error && (
          <p role="alert" className="text-[15px]">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className="justify-self-start bg-accent px-3 py-1 font-mono text-[12px] uppercase tracking-[0.08em] text-black disabled:opacity-50">
          {pending ? "Sending" : "Send message"}
        </button>
      </form>
    </>
  );
}
