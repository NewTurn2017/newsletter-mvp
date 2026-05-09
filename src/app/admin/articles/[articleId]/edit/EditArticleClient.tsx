"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { ArticleForm } from "@/components/articles/ArticleForm";

export function EditArticleClient({ articleId }: { articleId: string }) {
  const article = useQuery(api.articles.get as any, { articleId: articleId as any });
  if (article === undefined) return <main><p className="helper">글을 불러오는 중...</p></main>;
  if (article === null) return <main><section className="card"><h1>글을 찾을 수 없습니다</h1></section></main>;
  return <main><ArticleForm article={article as any} /></main>;
}
