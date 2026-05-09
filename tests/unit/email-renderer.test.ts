import { describe, expect, it } from "vitest";
import { renderArticleEmail } from "@/lib/email/renderArticleEmail";
import type { TiptapDoc } from "@/lib/tiptap/types";

const doc: TiptapDoc = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Body" }] }] };

describe("article email renderer", () => {
  it("includes subject, html body, plain text, and public URL", () => {
    const email = renderArticleEmail({ title: "Weekly Note", excerpt: "Short", editorJson: doc, publicUrl: "https://newsletter.test/articles/weekly-note" });
    expect(email.subject).toBe("Weekly Note");
    expect(email.html).toContain("Weekly Note");
    expect(email.html).toContain("Read on the web");
    expect(email.text).toContain("https://newsletter.test/articles/weekly-note");
  });
});
