import { tiptapToHtml } from "@/lib/render/tiptapToHtml";
import type { TiptapNode } from "@/lib/render/tiptapTypes";

type ArticleRendererProps = {
  title?: string;
  excerpt?: string;
  coverImageUrl?: string;
  editorJson?: TiptapNode;
  doc?: TiptapNode;
};

export function ArticleRenderer({ title, excerpt, coverImageUrl, editorJson, doc }: ArticleRendererProps) {
  const content = doc ?? editorJson;
  return (
    <article className="card stack">
      {title ? <h1 style={{ fontSize: 48, lineHeight: 1.05, margin: 0 }}>{title}</h1> : null}
      {excerpt ? <p className="notice" style={{ fontSize: 20 }}>{excerpt}</p> : null}
      {coverImageUrl ? <img src={coverImageUrl} alt="" style={{ width: "100%", borderRadius: 18 }} /> : null}
      <div className="prose" dangerouslySetInnerHTML={{ __html: content ? tiptapToHtml(content) : "" }} />
    </article>
  );
}
