export type MessageInput = { name: string; email: string; message: string; website: string };
export type ValidMessage = { name: string; email: string; message: string };
export type ValidationResult = { ok: true; value: ValidMessage } | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateMessage(input: MessageInput): ValidationResult {
  // The honeypot field is invisible to people. A value means a bot filled it.
  if (input.website.trim() !== "") return { ok: false, error: "Could not send the message." };
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  if (name.length < 1 || name.length > 100) return { ok: false, error: "Enter your name, up to 100 characters." };
  if (email.length > 254 || !EMAIL.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (message.length < 10 || message.length > 5000) return { ok: false, error: "Write a message of 10 to 5000 characters." };
  return { ok: true, value: { name, email, message } };
}
