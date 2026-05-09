import Link from "next/link";

export function ArticleToolbar({ articleId, slug, status }: { articleId?: string; slug?: string; status?: string }) {
  return (
    <div className="row">
      <Link className="button secondary" href="/admin/articles">목록으로</Link>
      {articleId ? <Link className="button secondary" href={`/admin/articles/${articleId}/preview`}>미리보기</Link> : null}
      {slug && status !== "draft" ? <Link className="button secondary" href={`/articles/${slug}`}>공개 URL</Link> : null}
    </div>
  );
}
