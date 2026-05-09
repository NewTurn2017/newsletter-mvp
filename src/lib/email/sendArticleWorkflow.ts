import { renderArticleEmail } from "./renderArticleEmail";
import type { TiptapDoc } from "../tiptap/types";

export type ArticleForSend = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  editorJson: TiptapDoc;
  status: "draft" | "published" | "sent";
};

export type SubscriberForSend = {
  _id: string;
  email: string;
};

export type EmailSendRecord = {
  _id: string;
  status: "pending" | "sent" | "failed";
};

export type SendArticleWorkflowDeps = {
  getArticle(): Promise<ArticleForSend | null>;
  listActiveSubscribers(): Promise<SubscriberForSend[]>;
  findExistingSend(subscriber: SubscriberForSend): Promise<EmailSendRecord | null>;
  ensurePendingSend(subscriber: SubscriberForSend, existing: EmailSendRecord | null): Promise<string>;
  sendEmail(input: { to: string; subject: string; html: string; text: string }): Promise<{ id: string }>;
  markSent(sendId: string, providerMessageId: string): Promise<void>;
  markFailed(sendId: string, error: string): Promise<void>;
  markArticleSent(): Promise<void>;
};

export type SendArticleWorkflowResult = {
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
};

export async function sendArticleWorkflow(deps: SendArticleWorkflowDeps, publicBaseUrl: string): Promise<SendArticleWorkflowResult> {
  const article = await deps.getArticle();
  if (!article || article.status !== "published") {
    throw new Error("Only published articles can be sent");
  }

  const publicUrl = `${publicBaseUrl.replace(/\/$/, "")}/articles/${article.slug}`;
  const email = renderArticleEmail({ title: article.title, excerpt: article.excerpt, editorJson: article.editorJson, publicUrl });
  const subscribers = await deps.listActiveSubscribers();

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const subscriber of subscribers) {
    const existing = await deps.findExistingSend(subscriber);
    if (existing?.status === "sent" || existing?.status === "pending") {
      skipped += 1;
      continue;
    }

    const sendId = await deps.ensurePendingSend(subscriber, existing);
    try {
      const provider = await deps.sendEmail({ to: subscriber.email, subject: email.subject, html: email.html, text: email.text });
      await deps.markSent(sendId, provider.id);
      sent += 1;
    } catch (error) {
      await deps.markFailed(sendId, error instanceof Error ? error.message : "Unknown send failure");
      failed += 1;
    }
  }

  if (sent > 0) await deps.markArticleSent();
  return { attempted: sent + failed, sent, failed, skipped };
}
