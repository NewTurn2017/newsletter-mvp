import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { ArticleRenderer } from "@/components/articles/ArticleRenderer";

function getClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  return convexUrl ? new ConvexHttpClient(convexUrl) : null;
}

type PublicArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PublicArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const convex = getClient();
  if (!convex) return { title: "뉴스레터", description: "공개된 뉴스레터 글입니다." };
  const article = await convex.query(api.articles.getBySlug, { slug });
  return article
    ? { title: article.title, description: article.excerpt ?? "공개된 뉴스레터 글입니다." }
    : { title: "글을 찾을 수 없음", description: "요청한 글을 찾을 수 없습니다." };
}

export default async function PublicArticlePage({ params }: PublicArticlePageProps) {
  const { slug } = await params;
  const convex = getClient();
  if (!convex) return <main className="container shell"><p>Convex URL이 설정되지 않았습니다.</p></main>;
  const article = await convex.query(api.articles.getBySlug, { slug });
  if (!article) notFound();
  return (
    <main className="container shell">
      <ArticleRenderer title={article.title} excerpt={article.excerpt} editorJson={article.editorJson as any} coverImageUrl={article.coverImageUrl} />
    </main>
  );
}
