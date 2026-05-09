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

export function ArticleList() {
  const articles = useQuery(api.articles.list) as ArticleListItem[] | undefined;
  if (!articles) return <p className="notice">Loading articles...</p>;
  if (articles.length === 0) return <p className="notice">No articles yet. Create your first draft.</p>;
  return (
    <div className="grid">
      {articles.map((article: ArticleListItem) => (
        <article key={article._id} className="card stack">
          <span className="badge">{article.status}</span>
          <h2>{article.title}</h2>
          <p className="notice">{article.excerpt ?? "No excerpt"}</p>
          <div className="row">
            <Link className="btn" href={`/admin/articles/${article._id}/edit`}>Edit</Link>
            <Link className="btn secondary" href={`/admin/articles/${article._id}/preview`}>Preview</Link>
            {article.status !== "draft" ? <Link className="btn secondary" href={`/articles/${article.slug}`}>Public</Link> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
