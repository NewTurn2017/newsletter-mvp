import type { TiptapNode } from "../render/tiptapTypes";
import { renderArticleEmail } from "./renderArticleEmail";

export type SendableArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: "draft" | "published" | "sent";
  editorJson: TiptapNode;
};

export type SendableSubscriber = {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
};

export type SendRecord = {
  id: string;
  articleId: string;
  subscriberId?: string;
  recipientEmail: string;
  status: "pending" | "sent" | "failed";
  providerMessageId?: string;
  error?: string;
};

export type EmailProvider = {
  send(input: { to: string; subject: string; html: string; text: string }): Promise<{ id: string }>;
};

export type SendArticleWorkflowInput = {
  article: SendableArticle;
  subscribers: SendableSubscriber[];
  existingSends?: SendRecord[];
  publicAppUrl: string;
  provider: EmailProvider;
  ensurePending: (subscriber: SendableSubscriber) => Promise<SendRecord>;
  markSent: (sendId: string, providerMessageId: string) => Promise<SendRecord>;
  markFailed: (sendId: string, error: string) => Promise<SendRecord>;
  markArticleSent: () => Promise<void>;
};

export type SendArticleWorkflowResult = {
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
  records: SendRecord[];
};

export async function sendArticleWorkflow(input: SendArticleWorkflowInput): Promise<SendArticleWorkflowResult> {
  if (input.article.status !== "published") throw new Error("Only published articles can be sent");
  const activeSubscribers = input.subscribers.filter((subscriber) => subscriber.status === "active");
  const publicUrl = `${input.publicAppUrl.replace(/\/$/, "")}/articles/${input.article.slug}`;
  const email = renderArticleEmail({
    title: input.article.title,
    excerpt: input.article.excerpt,
    editorJson: input.article.editorJson,
    publicUrl,
  });

  const records: SendRecord[] = [];
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const subscriber of activeSubscribers) {
    const existingSent = input.existingSends?.find(
      (record) => record.articleId === input.article.id && record.recipientEmail === subscriber.email && record.status === "sent",
    );
    if (existingSent) {
      skipped += 1;
      records.push(existingSent);
      continue;
    }

    const pending = await input.ensurePending(subscriber);
    try {
      const providerResult = await input.provider.send({ to: subscriber.email, ...email });
      const sentRecord = await input.markSent(pending.id, providerResult.id);
      records.push(sentRecord);
      sent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown email provider error";
      const failedRecord = await input.markFailed(pending.id, message);
      records.push(failedRecord);
      failed += 1;
    }
  }

  if (sent > 0) await input.markArticleSent();

  return { attempted: sent + failed, sent, failed, skipped, records };
}
