import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { sendNewsletterEmail } from "./lib/email";
import { renderArticleEmail } from "../src/lib/email/renderArticleEmail";

async function ensurePendingSend(ctx: any, articleId: any, subscriber: { _id: any; email: string }, existing: any) {
  if (existing && existing.status !== "failed") return existing._id;
  return await ctx.runMutation(internal.emailSends.createPending, {
    articleId,
    subscriberId: subscriber._id,
    recipientEmail: subscriber.email,
  });
}

async function markSendSent(ctx: any, emailSendId: any, providerMessageId?: string) {
  await ctx.runMutation(internal.emailSends.markSent, { emailSendId, providerMessageId });
}

async function markSendFailed(ctx: any, emailSendId: any, error: string) {
  await ctx.runMutation(internal.emailSends.markFailed, { emailSendId, error });
}

export const sendArticle = action({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args): Promise<{ attempted: number; sent: number; failed: number; skipped: number }> => {
    await requireAdmin(ctx);
    const article = await ctx.runQuery(internal.articles.getPublishedForSend, { articleId: args.articleId });
    const subscribers = await ctx.runQuery(internal.subscribers.listActiveForSend, {});
    const publicBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const publicUrl = `${publicBaseUrl.replace(/\/$/, "")}/articles/${article.slug}`;
    const email = renderArticleEmail({ title: article.title, excerpt: article.excerpt, editorJson: article.editorJson, publicUrl });

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const subscriber of subscribers) {
      const existing = await ctx.runQuery(internal.emailSends.findForArticleRecipient, {
        articleId: args.articleId,
        recipientEmail: subscriber.email,
      });
      if (existing?.status === "sent") {
        skipped += 1;
        continue;
      }
      const emailSendId = await ensurePendingSend(ctx, args.articleId, subscriber, existing);
      try {
        const provider = await sendNewsletterEmail({ to: subscriber.email, subject: email.subject, html: email.html, text: email.text });
        await markSendSent(ctx, emailSendId, provider.id);
        sent += 1;
      } catch (error) {
        failed += 1;
        await markSendFailed(ctx, emailSendId, error instanceof Error ? error.message : "Unknown send failure");
      }
    }

    if (sent > 0) await ctx.runMutation(internal.articles.markSent, { articleId: args.articleId });
    return { attempted: sent + failed, sent, failed, skipped };
  },
});
