import { isTiptapDoc } from "@/lib/render/tiptapTypes";

export type ArticleStatus = "draft" | "published" | "sent";

export type ArticleDraftInput = {
  title: string;
  editorJson: unknown;
  status?: ArticleStatus;
};

export function validateArticleDraft(input: ArticleDraftInput) {
  const title = input.title.trim();
  if (title.length < 2) throw new Error("Title is required");
  if (!isTiptapDoc(input.editorJson)) throw new Error("Tiptap doc content is required");
  const status = input.status ?? "draft";
  if (!["draft", "published", "sent"].includes(status)) throw new Error("Invalid article status");
  return { ...input, title, status };
}
