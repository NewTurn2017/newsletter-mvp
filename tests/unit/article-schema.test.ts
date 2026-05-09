import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";
import { canSendArticle } from "@/lib/send/idempotency";

describe("article primitives", () => {
  it("creates stable beginner-readable slugs", () => {
    expect(slugify(" My First Newsletter! ")).toBe("my-first-newsletter");
    expect(slugify("뉴스레터 첫 글")).toBe("뉴스레터-첫-글");
  });

  it("only allows published articles through send eligibility", () => {
    expect(canSendArticle("draft")).toBe(false);
    expect(canSendArticle("published")).toBe(true);
    expect(canSendArticle("sent")).toBe(false);
  });
});
