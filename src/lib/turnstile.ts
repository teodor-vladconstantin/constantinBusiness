import "server-only";

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileOptions = {
  secret?: string;
  ip?: string;
  action?: string;
  hostnames?: string[];
  fetchImpl?: typeof fetch;
};

const envHostnames = () =>
  (process.env.TURNSTILE_HOSTNAMES ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

// Asks Cloudflare whether the token is valid for this form. Any doubt returns false.
export async function verifyTurnstile(token: string, opts: TurnstileOptions = {}): Promise<boolean> {
  const secret = opts.secret ?? process.env.TURNSTILE_SECRET_KEY ?? "";
  if (!secret || !token || token.length > 2048) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (opts.ip) body.set("remoteip", opts.ip);

  try {
    const res = await (opts.fetchImpl ?? fetch)(SITEVERIFY, { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean; action?: string; hostname?: string; metadata?: { result_with_testing_key?: boolean } };
    if (data.success !== true) return false;
    // Cloudflare test keys return no action and a fixed hostname. Only the real keys are held to both checks.
    if (data.metadata?.result_with_testing_key === true) return true;
    if (data.action !== (opts.action ?? "contact")) return false;
    const allowed = opts.hostnames ?? envHostnames();
    if (allowed.length > 0 && !allowed.includes(data.hostname ?? "")) return false;
    return true;
  } catch {
    return false;
  }
}
