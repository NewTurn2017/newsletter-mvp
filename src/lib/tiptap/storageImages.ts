import type { TiptapDoc, TiptapNode } from "./types";

export type StoredImageAttrs = {
  src?: string;
  alt?: string;
  title?: string;
  storageId?: string;
  [key: string]: unknown;
};

function cloneNode(node: TiptapNode, mapImageAttrs: (attrs: StoredImageAttrs) => StoredImageAttrs): TiptapNode {
  const next: TiptapNode = { ...node };
  if (node.attrs) next.attrs = { ...node.attrs };
  if (node.type === "image") {
    next.attrs = mapImageAttrs((next.attrs ?? {}) as StoredImageAttrs);
  }
  if (node.marks) next.marks = node.marks.map((mark) => ({ ...mark, attrs: mark.attrs ? { ...mark.attrs } : undefined }));
  if (node.content) next.content = node.content.map((child) => cloneNode(child, mapImageAttrs));
  return next;
}

export function stripGeneratedImageUrls(doc: TiptapDoc): TiptapDoc {
  return cloneNode(doc, (attrs) => {
    if (!attrs.storageId) return attrs;
    const { src: _src, ...rest } = attrs;
    return rest;
  }) as TiptapDoc;
}

export async function hydrateStoredImageUrls(
  value: unknown,
  resolveUrl: (storageId: string) => Promise<string | null>,
): Promise<unknown> {
  if (!value || typeof value !== "object" || (value as { type?: unknown }).type !== "doc") return value;

  async function hydrateNode(node: TiptapNode): Promise<TiptapNode> {
    const next: TiptapNode = { ...node };
    if (node.attrs) next.attrs = { ...node.attrs };
    if (node.type === "image" && typeof next.attrs?.storageId === "string") {
      const url = await resolveUrl(next.attrs.storageId);
      if (url) next.attrs = { ...next.attrs, src: url };
    }
    if (node.marks) next.marks = node.marks.map((mark) => ({ ...mark, attrs: mark.attrs ? { ...mark.attrs } : undefined }));
    if (node.content) next.content = await Promise.all(node.content.map(hydrateNode));
    return next;
  }

  return hydrateNode(value as TiptapNode);
}
