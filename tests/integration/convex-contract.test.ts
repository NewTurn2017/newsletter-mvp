import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Convex newsletter contract", () => {
  it("keeps send orchestration in convex/sendArticle.ts with Convex-side admin guard", () => {
    const source = readFileSync("convex/sendArticle.ts", "utf8");
    expect(source).toContain("export const sendArticle");
    expect(source).toContain("await requireAdmin(ctx)");
    expect(source).toContain("sendArticleWorkflow");
    expect(source).toContain("sendNewsletterEmail");
    expect(source).toContain("api.articles.getForSend");
    expect(source).toContain("api.emailSends.ensurePending");
    expect(source).toContain("api.emailSends.markSent");
    expect(source).toContain("api.emailSends.markFailed");
  });

  it("guards Convex write/publish/send mutations with requireAdmin", () => {
    for (const file of ["convex/articles.ts", "convex/subscribers.ts", "convex/emailSends.ts"]) {
      const source = readFileSync(file, "utf8");
      expect(source).toContain("requireAdmin");
    }
  });
});
