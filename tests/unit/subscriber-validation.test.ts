import { describe, expect, it } from "vitest";
import { assertValidEmail, isValidEmail, normalizeEmail } from "@/lib/subscribers/validation";

describe("subscriber email validation", () => {
  it("normalizes and accepts valid email addresses", () => {
    expect(normalizeEmail(" Reader@Example.COM ")).toBe("reader@example.com");
    expect(isValidEmail("reader@example.com")).toBe(true);
  });

  it("rejects invalid addresses", () => {
    expect(isValidEmail("nope")).toBe(false);
    expect(() => assertValidEmail("missing-at.example.com")).toThrow("Invalid email");
  });
});
