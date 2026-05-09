import type { TiptapMark, TiptapNode } from "./tiptapTypes";
import { isTiptapDoc } from "./tiptapTypes";
import { safeUrl } from "./sanitize";

function applyTextMarks(text: string, marks: TiptapMark[] = []): string {
  const link = marks.find((mark) => mark.type === "link");
  const href = safeUrl(link?.attrs?.href);
  return href ? `${text} (${href})` : text;
}

function collect(node: TiptapNode): string {
  if (node.type === "text") return applyTextMarks(node.text ?? "", node.marks);
  if (node.type === "hardBreak") return "\n";
  if (node.type === "image") {
    const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "image";
    return `[Image: ${alt}]`;
  }
  const joined = (node.content ?? []).map(collect).join("");
  if (["paragraph", "heading", "blockquote", "listItem"].includes(node.type)) return `${joined}\n`;
  return joined;
}

export function tiptapToPlainText(value: unknown): string {
  if (!isTiptapDoc(value)) return "";
  return collect(value).replace(/\n{3,}/g, "\n\n").trim();
}
