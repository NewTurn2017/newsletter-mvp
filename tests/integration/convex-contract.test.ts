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

  it("keeps Convex Storage image upload functions behind admin auth", () => {
    const source = readFileSync("convex/files.ts", "utf8");
    expect(source).toContain("generateImageUploadUrl");
    expect(source).toContain("ctx.storage.generateUploadUrl");
    expect(source).toContain("resolveImageUrl");
    expect(source).toContain("await requireAdmin(ctx)");
  });

  it("stores article cover images by Convex storage id", () => {
    const schema = readFileSync("convex/schema.ts", "utf8");
    const articles = readFileSync("convex/articles.ts", "utf8");
    expect(schema).toContain('coverImageId: v.optional(v.id("_storage"))');
    expect(articles).toContain("stripGeneratedImageUrls");
    expect(articles).toContain("hydrateStoredImageUrls");
  });


  it("generates article slugs and summaries through OpenAI-backed Convex actions", () => {
    const source = readFileSync("convex/aiSlug.ts", "utf8");
    expect(source).toContain("generateArticleSlug");
    expect(source).toContain("generateArticleSummary");
    expect(source).toContain("gpt-5.4-nano");
    expect(source).toContain("OPENAI_API_KEY");
    expect(source).toContain("https://api.openai.com/v1/responses");
    expect(source).toContain("tiptapToPlainText");
    expect(source).toContain("article_summary");
    expect(source).toContain("await requireAdmin(ctx)");
  });

  it("keeps slug editing hidden and summary editing automatic in the article form", () => {
    const source = readFileSync("src/components/articles/ArticleForm.tsx", "utf8");
    expect(source).not.toContain("<label>슬러그");
    expect(source).toContain("generateArticleSlug");
    expect(source).toContain("generateArticleSummary");
    expect(source).toContain("AI가 자동 생성");
    expect(source).toContain('readOnly placeholder="저장하면 OpenAI가 본문에 맞게 두 줄 요약을 자동 생성합니다."');
  });

  it("supports Tiptap image resizing without storing external image URLs", () => {
    const schema = readFileSync("src/lib/tiptap/schema.ts", "utf8");
    const nodeView = readFileSync("src/components/editor/ResizableImageNodeView.tsx", "utf8");
    const renderer = readFileSync("src/lib/render/tiptapToHtml.ts", "utf8");
    expect(schema).toContain("width");
    expect(schema).toContain("ReactNodeViewRenderer");
    expect(schema).toContain("ResizableImageNodeView");
    expect(nodeView).toContain("image-resize-handle");
    expect(nodeView).toContain("updateAttributes({ width");
    expect(renderer).toContain("safeImageWidth");
  });

});
