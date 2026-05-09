import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./lib/auth";
import { sendNewsletterEmail } from "./lib/email";
import { sendArticleWorkflow, type ArticleForSend } from "../src/lib/email/sendArticleWorkflow";
import { isTiptapDoc } from "../src/lib/tiptap/types";

export const sendArticle = action({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args): Promise<{ attempted: number; sent: number; failed: number; skipped: number }> => {
    await requireAdmin(ctx);
    const publicBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    return sendArticleWorkflow<Id<"articles">, Id<"subscribers">, Id<"emailSends">>(
      {
        getArticle: async () => {
          const article = await ctx.runQuery(api.articles.getForSend, { articleId: args.articleId });
          if (!article) return null;
          if (!isTiptapDoc(article.editorJson)) throw new Error("편집기 내용을 메일로 렌더링할 수 없습니다.");
          return article as ArticleForSend<Id<"articles">>;
        },
        listActiveSubscribers: async () => ctx.runQuery(api.subscribers.listActive, {}),
        findExistingSend: async (subscriber) =>
          ctx.runQuery(api.emailSends.findForArticleRecipient, {
            articleId: args.articleId,
            recipientEmail: subscriber.email,
          }),
        ensurePendingSend: async (subscriber) =>
          ctx.runMutation(api.emailSends.ensurePending, {
            articleId: args.articleId,
            subscriberId: subscriber._id,
            recipientEmail: subscriber.email,
          }),
        sendEmail: sendNewsletterEmail,
        markSent: async (sendId, providerMessageId) => {
          await ctx.runMutation(api.emailSends.markSent, { sendId, providerMessageId });
        },
        markFailed: async (sendId, error) => {
          await ctx.runMutation(api.emailSends.markFailed, { sendId, error });
        },
        markArticleSent: async () => {
          await ctx.runMutation(api.articles.markSent, { articleId: args.articleId });
        },
      },
      publicBaseUrl,
    );
  },
});
