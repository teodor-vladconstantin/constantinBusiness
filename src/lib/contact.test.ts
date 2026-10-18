import { describe, expect, it } from "vitest";
import { validateMessage } from "@/lib/contact";

const valid = { name: "Ada", email: "ada@example.com", message: "I need a small internal tool.", website: "" };

describe("validateMessage", () => {
  it("accepts a valid message and trims the fields", () => {
    const r = validateMessage({ ...valid, name: "  Ada  ", message: "  I need a small internal tool.  " });
    expect(r).toEqual({ ok: true, value: { name: "Ada", email: "ada@example.com", message: "I need a small internal tool." } });
  });

  it("rejects an empty name", () => {
    expect(validateMessage({ ...valid, name: "   " }).ok).toBe(false);
  });

  it("rejects a name longer than 100 characters", () => {
    expect(validateMessage({ ...valid, name: "a".repeat(101) }).ok).toBe(false);
  });

  it("rejects a bad email", () => {
    expect(validateMessage({ ...valid, email: "not-an-email" }).ok).toBe(false);
  });

  it("rejects a message shorter than 10 characters", () => {
    expect(validateMessage({ ...valid, message: "too short" }).ok).toBe(false);
  });

  it("rejects a message longer than 5000 characters", () => {
    expect(validateMessage({ ...valid, message: "a".repeat(5001) }).ok).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(validateMessage({ ...valid, website: "http://spam.example" }).ok).toBe(false);
  });
});
