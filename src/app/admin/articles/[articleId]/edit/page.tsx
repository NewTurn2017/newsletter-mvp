import { EditArticleClient } from "./EditArticleClient";

export default async function EditArticlePage({ params }: { params: Promise<{ articleId: string }> }) {
  const { articleId } = await params;
  return <EditArticleClient articleId={articleId} />;
}
