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
  if (!convex) return { title: "Newsletter", description: "A published newsletter article." };
  const article = await convex.query(api.articles.getBySlug, { slug });
  return article
    ? { title: article.title, description: article.excerpt ?? "A published newsletter article." }
    : { title: "Not Found", description: "Article not found" };
}

export default async function PublicArticlePage({ params }: PublicArticlePageProps) {
  const { slug } = await params;
  const convex = getClient();
  if (!convex) return <main className="container shell"><p>Convex URL is not configured.</p></main>;
  const article = await convex.query(api.articles.getBySlug, { slug });
  if (!article) notFound();
  return (
    <main className="container shell">
      <ArticleRenderer title={article.title} excerpt={article.excerpt} editorJson={article.editorJson} coverImageUrl={article.coverImageUrl} />
    </main>
  );
}
