import { PreviewArticleClient } from "./PreviewArticleClient";

export default async function PreviewArticlePage({ params }: { params: Promise<{ articleId: string }> }) {
  const { articleId } = await params;
  return <PreviewArticleClient articleId={articleId} />;
}
