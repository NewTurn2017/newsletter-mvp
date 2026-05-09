"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../../../convex/_generated/api";
import { ArticleRenderer } from "@/components/articles/ArticleRenderer";
import { SendArticleButton } from "@/components/articles/SendArticleButton";
import { SendStatusPanel } from "@/components/articles/SendStatusPanel";
import { isTiptapDoc } from "@/lib/tiptap/types";

export function PreviewArticleClient({ articleId }: { articleId: string }) {
  const article = useQuery(api.articles.get as any, { articleId: articleId as any });
  if (article === undefined) return <main><p className="helper">Loading preview...</p></main>;
  if (!article) return <main><section className="card"><h1>Article not found</h1></section></main>;
  return (
    <main className="stack">
      <section className="card stack">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="button secondary" href={`/admin/articles/${article._id}/edit`}>Edit</Link>
          {(article.status === "published" || article.status === "sent") ? <Link className="button secondary" href={`/articles/${article.slug}`}>Open public URL</Link> : null}
        </div>
        <span className="status-pill">Preview: {article.status}</span>
        <h1>{article.title}</h1>
        {article.excerpt ? <p className="helper">{article.excerpt}</p> : null}
        {isTiptapDoc(article.editorJson) ? <ArticleRenderer doc={article.editorJson} /> : <p>Invalid editor content.</p>}
        <SendArticleButton articleId={article._id} disabled={article.status === "draft"} />
      </section>
      <SendStatusPanel articleId={article._id} />
    </main>
  );
}
