"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { SendArticleButton } from "@/components/articles/SendArticleButton";
import { SendStatusPanel } from "@/components/articles/SendStatusPanel";

const statusLabels: Record<string, string> = { draft: "드래프트", published: "공개", sent: "발송 완료" };

export default function ArticlesPage() {
  const articles = useQuery(api.articles.list as any);
  return (
    <main className="stack">
      <section className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div><p className="status-pill">글 관리</p><h1>글 목록</h1></div>
          <Link className="button" href="/admin/articles/new">새 글 작성</Link>
        </div>
        {articles === undefined ? <p className="helper">불러오는 중...</p> : null}
        {articles?.length === 0 ? <p className="helper">아직 글이 없습니다. 첫 드래프트를 작성해보세요.</p> : null}
        <div className="stack">
          {articles?.map((article: any) => (
            <article key={article._id} className="card stack">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <span className="status-pill">{statusLabels[article.status] ?? article.status}</span>
                  <h2>{article.title}</h2>
                </div>
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <Link className="button secondary" href={`/admin/articles/${article._id}/edit`}>수정</Link>
                  <Link className="button secondary" href={`/admin/articles/${article._id}/preview`}>미리보기</Link>
                  {(article.status === "published" || article.status === "sent") ? <Link className="button secondary" href={`/articles/${article.slug}`}>공개 글</Link> : null}
                </div>
              </div>
              <SendArticleButton articleId={article._id} disabled={article.status !== "published"} />
              <SendStatusPanel articleId={article._id} />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
