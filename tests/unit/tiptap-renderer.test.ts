import { describe, expect, it } from "vitest";
import { tiptapToHtml } from "@/lib/render/tiptapToHtml";
import { tiptapToPlainText } from "@/lib/render/tiptapToPlainText";
import type { TiptapDoc } from "@/lib/tiptap/types";

const doc: TiptapDoc = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Hello" }] },
    { type: "paragraph", content: [{ type: "text", text: "World", marks: [{ type: "bold" }] }] },
    { type: "paragraph", content: [{ type: "text", text: "Link", marks: [{ type: "link", attrs: { href: "https://example.com" } }] }] },
    { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "One" }] }] }] },
    { type: "orderedList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "First" }] }] }] },
    { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "Quote" }] }] },
    { type: "paragraph", content: [{ type: "text", text: "Line" }, { type: "hardBreak" }, { type: "text", text: "Break" }] },
    { type: "image", attrs: { src: "https://example.com/image.jpg", alt: "Example", width: 360 } },
  ],
};

describe("Tiptap renderers", () => {
  it("renders supported MVP nodes to safe HTML", () => {
    const html = tiptapToHtml(doc);
    expect(html).toContain("<h2>Hello</h2>");
    expect(html).toContain("<strong>World</strong>");
    expect(html).toContain('href="https://example.com/"');
    expect(html).toContain("<ul><li><p>One</p></li></ul>");
    expect(html).toContain("<ol><li><p>First</p></li></ol>");
    expect(html).toContain("<blockquote><p>Quote</p></blockquote>");
    expect(html).toContain("Line<br />Break");
    expect(html).toContain('src="https://example.com/image.jpg"');
    expect(html).toContain('style="width:360px;max-width:100%;height:auto;border-radius:12px;"');
  });

  it("drops unsafe image and link URLs", () => {
    const html = tiptapToHtml({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "bad", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] }] },
        { type: "image", attrs: { src: "javascript:alert(1)", alt: "bad" } },
      ],
    });
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("<img");
  });

  it("renders readable plain text", () => {
    expect(tiptapToPlainText(doc)).toContain("Hello");
    const text = tiptapToPlainText(doc);
    expect(text).toContain("First");
    expect(text).toContain("Line\nBreak");
    expect(text).toContain("[Image: Example]");
  });
});
