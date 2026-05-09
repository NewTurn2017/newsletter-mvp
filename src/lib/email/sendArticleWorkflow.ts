import { renderArticleEmail } from "./renderArticleEmail";
import type { TiptapDoc } from "../tiptap/types";

export type ArticleForSend<TArticleId extends string = string> = {
  _id: TArticleId;
  title: string;
  slug: string;
  excerpt?: string;
  editorJson: TiptapDoc;
  status: "draft" | "published" | "sent";
};

export type SubscriberForSend<TSubscriberId extends string = string> = {
  _id: TSubscriberId;
  email: string;
};

export type EmailSendRecord<TSendId extends string = string> = {
  _id: TSendId;
  status: "pending" | "sent" | "failed";
};

export type SendArticleWorkflowDeps<
  TArticleId extends string = string,
  TSubscriberId extends string = string,
  TSendId extends string = string,
> = {
  getArticle(): Promise<ArticleForSend<TArticleId> | null>;
  listActiveSubscribers(): Promise<SubscriberForSend<TSubscriberId>[]>;
  findExistingSend(subscriber: SubscriberForSend<TSubscriberId>): Promise<EmailSendRecord<TSendId> | null>;
  ensurePendingSend(subscriber: SubscriberForSend<TSubscriberId>, existing: EmailSendRecord<TSendId> | null): Promise<TSendId>;
  sendEmail(input: { to: string; subject: string; html: string; text: string }): Promise<{ id: string }>;
  markSent(sendId: TSendId, providerMessageId: string): Promise<void>;
  markFailed(sendId: TSendId, error: string): Promise<void>;
  markArticleSent(): Promise<void>;
};

export type SendArticleWorkflowResult = {
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
};

export async function sendArticleWorkflow<
  TArticleId extends string = string,
  TSubscriberId extends string = string,
  TSendId extends string = string,
>(deps: SendArticleWorkflowDeps<TArticleId, TSubscriberId, TSendId>, publicBaseUrl: string): Promise<SendArticleWorkflowResult> {
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
