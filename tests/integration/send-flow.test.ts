import { describe, expect, it } from "vitest";
import { renderArticleEmail } from "@/lib/email/renderArticleEmail";
import { shouldCallProvider, shouldCreatePendingSend } from "@/lib/send/idempotency";
import type { TiptapDoc } from "@/lib/tiptap/types";

const doc: TiptapDoc = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Launch" }] },
    { type: "paragraph", content: [{ type: "text", text: "Published body" }] },
  ],
};

describe("send flow contract", () => {
  it("creates pending only for new or failed article-recipient records", () => {
    expect(shouldCreatePendingSend(undefined)).toBe(true);
    expect(shouldCallProvider(undefined)).toBe(true);
    expect(shouldCreatePendingSend({ status: "failed" })).toBe(true);
    expect(shouldCallProvider({ status: "failed" })).toBe(true);
    expect(shouldCreatePendingSend({ status: "pending" })).toBe(false);
    expect(shouldCallProvider({ status: "sent" })).toBe(false);
  });

  it("renders payload shape expected by Resend calls", () => {
    const email = renderArticleEmail({ title: "Launch", editorJson: doc, publicUrl: "https://app.test/articles/launch" });
    expect(email.subject).toBe("Launch");
    expect(email.html).toContain("<article>");
    expect(email.text).toContain("Published body");
    expect(email.text).toContain("https://app.test/articles/launch");
  });
});
