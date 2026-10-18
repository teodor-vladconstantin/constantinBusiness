"use server";

import { headers } from "next/headers";
import { validateMessage } from "@/lib/contact";
import { insertMessage } from "@/lib/messages";
import { verifyTurnstile } from "@/lib/turnstile";

export type ContactState = { ok: boolean; error?: string; values?: { name: string; email: string; message: string } };

const field = (f: FormData, k: string) => String(f.get(k) ?? "");

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values = { name: field(formData, "name"), email: field(formData, "email"), message: field(formData, "message") };
  const checked = validateMessage({ ...values, website: field(formData, "website") });
  if (!checked.ok) return { ok: false, error: checked.error, values };

  const forwarded = (await headers()).get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || undefined;
  const human = await verifyTurnstile(field(formData, "cf-turnstile-response"), { ip, action: "contact" });
  if (!human) return { ok: false, error: "The check did not pass. Please try again.", values };

  const stored = await insertMessage(checked.value);
  if (!stored) return { ok: false, error: "Could not send the message. Please try again.", values };
  return { ok: true };
}
