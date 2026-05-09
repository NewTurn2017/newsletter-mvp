import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Convex newsletter contract", () => {
  it("keeps send orchestration in convex/sendArticle.ts with Convex-side admin guard", () => {
    const source = readFileSync("convex/sendArticle.ts", "utf8");
    expect(source).toContain("export const sendArticle");
    expect(source).toContain("await requireAdmin(ctx)");
    expect(source).toContain("sendNewsletterEmail");
    expect(source).toContain("ensurePendingSend");
    expect(source).toContain("markSendSent");
    expect(source).toContain("markSendFailed");
  });

  it("guards Convex write/publish/send mutations with requireAdmin", () => {
    for (const file of ["convex/articles.ts", "convex/subscribers.ts", "convex/emailSends.ts"]) {
      const source = readFileSync(file, "utf8");
      expect(source).toContain("requireAdmin");
    }
  });
});
