"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { SendArticleButton } from "@/components/articles/SendArticleButton";
import { SendStatusPanel } from "@/components/articles/SendStatusPanel";

export default function ArticlesPage() {
  const articles = useQuery(api.articles.list as any);
  return (
    <main className="stack">
      <section className="card stack">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div><p className="status-pill">Articles</p><h1>Article list</h1></div>
          <Link className="button" href="/admin/articles/new">New article</Link>
        </div>
        {articles === undefined ? <p className="helper">Loading...</p> : null}
        {articles?.length === 0 ? <p className="helper">No articles yet. Create your first draft.</p> : null}
        <div className="stack">
          {articles?.map((article: any) => (
            <article key={article._id} className="card stack">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <span className="status-pill">{article.status}</span>
                  <h2>{article.title}</h2>
                  <p className="helper">/{article.slug}</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <Link className="button secondary" href={`/admin/articles/${article._id}/edit`}>Edit</Link>
                  <Link className="button secondary" href={`/admin/articles/${article._id}/preview`}>Preview</Link>
                  {(article.status === "published" || article.status === "sent") ? <Link className="button secondary" href={`/articles/${article.slug}`}>Public</Link> : null}
                </div>
              </div>
              <SendArticleButton articleId={article._id} disabled={article.status === "draft"} />
              <SendStatusPanel articleId={article._id} />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
