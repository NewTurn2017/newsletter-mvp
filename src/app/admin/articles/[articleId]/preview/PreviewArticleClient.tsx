"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../../../convex/_generated/api";
import { ArticleRenderer } from "@/components/articles/ArticleRenderer";
import { SendArticleButton } from "@/components/articles/SendArticleButton";
import { SendStatusPanel } from "@/components/articles/SendStatusPanel";
import { isTiptapDoc } from "@/lib/tiptap/types";

const statusLabels: Record<string, string> = { draft: "드래프트", published: "공개", sent: "발송 완료" };

export function PreviewArticleClient({ articleId }: { articleId: string }) {
  const article = useQuery(api.articles.get as any, { articleId: articleId as any });
  if (article === undefined) return <main><p className="helper">미리보기를 불러오는 중...</p></main>;
  if (!article) return <main><section className="card"><h1>글을 찾을 수 없습니다</h1></section></main>;
  return (
    <main className="stack">
      <section className="card stack">
        <div className="row">
          <Link className="button secondary" href={`/admin/articles/${article._id}/edit`}>수정</Link>
          {(article.status === "published" || article.status === "sent") ? <Link className="button secondary" href={`/articles/${article.slug}`}>공개 URL 열기</Link> : null}
        </div>
        <span className="status-pill">미리보기: {statusLabels[article.status] ?? article.status}</span>
        <h1>{article.title}</h1>
        {article.excerpt ? <p className="helper">{article.excerpt}</p> : null}
        {isTiptapDoc(article.editorJson) ? <ArticleRenderer doc={article.editorJson} coverImageUrl={article.coverImageUrl} /> : <p>편집기 내용을 표시할 수 없습니다.</p>}
        <SendArticleButton articleId={article._id} disabled={article.status !== "published"} />
      </section>
      <SendStatusPanel articleId={article._id} />
    </main>
  );
}
