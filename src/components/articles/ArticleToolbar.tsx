import Link from "next/link";

export function ArticleToolbar({ articleId, slug, status }: { articleId?: string; slug?: string; status?: string }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <Link className="button secondary" href="/admin/articles">Back to list</Link>
      {articleId ? <Link className="button secondary" href={`/admin/articles/${articleId}/preview`}>Preview</Link> : null}
      {slug && status !== "draft" ? <Link className="button secondary" href={`/articles/${slug}`}>Public URL</Link> : null}
    </div>
  );
}
