import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Resend Convex configuration", () => {
  it("does not silently mark sends as sent when RESEND_API_KEY is missing", () => {
    const source = readFileSync("convex/lib/email.ts", "utf8");
    expect(source).toContain('process.env.RESEND_MOCK === "1"');
    expect(source).toContain("if (!apiKey) throw new Error");
    expect(source).not.toContain('if (!apiKey || process.env.RESEND_MOCK === "1")');
  });
});
