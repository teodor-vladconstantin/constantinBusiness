import { describe, expect, it, vi } from "vitest";
import { verifyTurnstile } from "@/lib/turnstile";

const reply = (body: unknown, ok = true) => vi.fn(async () => ({ ok, json: async () => body }) as Response);

describe("verifyTurnstile", () => {
  it("accepts a successful response with the right action", async () => {
    const f = reply({ success: true, action: "contact", hostname: "example.com" });
    expect(await verifyTurnstile("tok", { secret: "s", fetchImpl: f })).toBe(true);
  });

  it("sends secret, response and remoteip as a form body", async () => {
    const f = reply({ success: true, action: "contact" });
    await verifyTurnstile("tok", { secret: "s", ip: "1.2.3.4", fetchImpl: f });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(init.method).toBe("POST");
    const body = init.body as URLSearchParams;
    expect(body.get("secret")).toBe("s");
    expect(body.get("response")).toBe("tok");
    expect(body.get("remoteip")).toBe("1.2.3.4");
  });

  it("rejects an empty token without calling Cloudflare", async () => {
    const f = reply({ success: true });
    expect(await verifyTurnstile("", { secret: "s", fetchImpl: f })).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it("rejects a token longer than 2048 characters without calling Cloudflare", async () => {
    const f = reply({ success: true });
    expect(await verifyTurnstile("a".repeat(2049), { secret: "s", fetchImpl: f })).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it("rejects when the secret is missing", async () => {
    const f = reply({ success: true, action: "contact" });
    expect(await verifyTurnstile("tok", { secret: "", fetchImpl: f })).toBe(false);
  });

  it("rejects success false", async () => {
    expect(await verifyTurnstile("tok", { secret: "s", fetchImpl: reply({ success: false }) })).toBe(false);
  });

  it("rejects a different action", async () => {
    const f = reply({ success: true, action: "login" });
    expect(await verifyTurnstile("tok", { secret: "s", fetchImpl: f })).toBe(false);
  });

  it("rejects a hostname outside the allowlist", async () => {
    const f = reply({ success: true, action: "contact", hostname: "evil.example" });
    expect(await verifyTurnstile("tok", { secret: "s", hostnames: ["example.com"], fetchImpl: f })).toBe(false);
  });

  it("accepts a hostname inside the allowlist", async () => {
    const f = reply({ success: true, action: "contact", hostname: "example.com" });
    expect(await verifyTurnstile("tok", { secret: "s", hostnames: ["example.com"], fetchImpl: f })).toBe(true);
  });

  it("rejects a non-OK HTTP response", async () => {
    expect(await verifyTurnstile("tok", { secret: "s", fetchImpl: reply({ success: true }, false) })).toBe(false);
  });

  it("rejects when the request throws", async () => {
    const f = vi.fn(async () => {
      throw new Error("network");
    });
    expect(await verifyTurnstile("tok", { secret: "s", fetchImpl: f as unknown as typeof fetch })).toBe(false);
  });
});
