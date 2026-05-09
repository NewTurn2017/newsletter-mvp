import type { TiptapMark, TiptapNode } from "@/lib/render/tiptapTypes";
import { isTiptapDoc } from "@/lib/render/tiptapTypes";
import { escapeHtml, safeImageUrl, safeUrl } from "@/lib/render/sanitize";

const supportedNodes = new Set(["doc", "paragraph", "heading", "text", "bulletList", "orderedList", "listItem", "blockquote", "hardBreak", "image"]);
const supportedMarks = new Set(["bold", "italic", "link"]);

function renderChildren(node: TiptapNode): string {
  return (node.content ?? []).map(renderNode).join("");
}

function renderText(text: string, marks: TiptapMark[] = []): string {
  return marks.reduce((html, mark) => {
    if (!supportedMarks.has(mark.type)) return html;
    if (mark.type === "bold") return `<strong>${html}</strong>`;
    if (mark.type === "italic") return `<em>${html}</em>`;
    if (mark.type === "link") {
      const href = safeUrl(mark.attrs?.href);
      if (!href) return html;
      return `<a href="${escapeHtml(href)}" rel="noopener noreferrer" target="_blank">${html}</a>`;
    }
    return html;
  }, escapeHtml(text));
}

function renderNode(node: TiptapNode): string {
  if (!supportedNodes.has(node.type)) return renderChildren(node);
  switch (node.type) {
    case "doc": return renderChildren(node);
    case "text": return renderText(node.text ?? "", node.marks);
    case "paragraph": {
      const content = renderChildren(node);
      return content.trim() ? `<p>${content}</p>` : "<p><br /></p>";
    }
    case "heading": {
      const level = Math.min(Math.max(Number(node.attrs?.level ?? 2), 1), 3);
      return `<h${level}>${renderChildren(node)}</h${level}>`;
    }
    case "bulletList": return `<ul>${renderChildren(node)}</ul>`;
    case "orderedList": return `<ol>${renderChildren(node)}</ol>`;
    case "listItem": return `<li>${renderChildren(node)}</li>`;
    case "blockquote": return `<blockquote>${renderChildren(node)}</blockquote>`;
    case "hardBreak": return "<br />";
    case "image": {
      const src = safeImageUrl(node.attrs?.src);
      if (!src) return "";
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="max-width:100%;height:auto;border-radius:12px;" /></figure>`;
    }
    default: return renderChildren(node);
  }
}

export function tiptapToHtml(value: unknown): string {
  return isTiptapDoc(value) ? renderNode(value) : "";
}
