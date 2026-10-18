"use client";

import { useActionState } from "react";
import { sendLink, type LoginState } from "./actions";

const initial: LoginState = { sent: false };

export function LoginForm() {
  const [state, action, pending] = useActionState(sendLink, initial);
  if (state.sent) return <p className="prose-site">If that address is allowed, a login link is on its way. Open it on this device.</p>;
  return (
    <form action={action} className="grid max-w-[420px] gap-3">
      <label className="grid gap-1">
        <span className="label">Email</span>
        <input name="email" type="email" required autoComplete="email" className="w-full border border-line bg-transparent px-2 py-1 text-[16px] text-fg outline-none focus:border-fg" />
      </label>
      <button type="submit" disabled={pending} className="justify-self-start bg-accent px-3 py-1 font-mono text-[12px] uppercase tracking-[0.08em] text-black disabled:opacity-50">
        {pending ? "Sending" : "Send link"}
      </button>
    </form>
  );
}
