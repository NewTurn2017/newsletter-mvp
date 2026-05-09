"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";

type ArticleListItem = {
  _id: string;
  status: "draft" | "published" | "sent";
  title: string;
  excerpt?: string;
  slug: string;
};

const statusLabels: Record<ArticleListItem["status"], string> = { draft: "드래프트", published: "공개", sent: "발송 완료" };

export function ArticleList() {
  const articles = useQuery(api.articles.list) as ArticleListItem[] | undefined;
  if (!articles) return <p className="notice">글을 불러오는 중...</p>;
  if (articles.length === 0) return <p className="notice">아직 글이 없습니다. 첫 드래프트를 작성해보세요.</p>;
  return (
    <div className="grid">
      {articles.map((article: ArticleListItem) => (
        <article key={article._id} className="card stack">
          <span className="badge">{statusLabels[article.status]}</span>
          <h2>{article.title}</h2>
          <p className="notice">{article.excerpt ?? "요약 없음"}</p>
          <div className="row">
            <Link className="btn" href={`/admin/articles/${article._id}/edit`}>수정</Link>
            <Link className="btn secondary" href={`/admin/articles/${article._id}/preview`}>미리보기</Link>
            {article.status !== "draft" ? <Link className="btn secondary" href={`/articles/${article.slug}`}>공개 글</Link> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
