import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/auth";

export const listByArticle = queryGeneric({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.query("emailSends").withIndex("by_article", (q) => q.eq("articleId", args.articleId)).collect();
  },
});

export const findForArticleRecipient = queryGeneric({
  args: { articleId: v.id("articles"), recipientEmail: v.string() },
  handler: async (ctx, args) => {
    const sends = await ctx.db.query("emailSends").withIndex("by_article", (q) => q.eq("articleId", args.articleId)).collect();
    return sends.find((send) => send.recipientEmail === args.recipientEmail) ?? null;
  },
});

export const ensurePending = mutationGeneric({
  args: { articleId: v.id("articles"), subscriberId: v.optional(v.id("subscribers")), recipientEmail: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = (await ctx.db
      .query("emailSends")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .collect()).find((send) => send.recipientEmail === args.recipientEmail);
    if (existing) return existing._id;
    const now = Date.now();
    return ctx.db.insert("emailSends", { ...args, status: "pending", createdAt: now, updatedAt: now });
  },
});

export const markSent = mutationGeneric({
  args: { sendId: v.id("emailSends"), providerMessageId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    await ctx.db.patch(args.sendId, { status: "sent", providerMessageId: args.providerMessageId, sentAt: now, updatedAt: now });
    return ctx.db.get(args.sendId);
  },
});

export const markFailed = mutationGeneric({
  args: { sendId: v.id("emailSends"), error: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.sendId, { status: "failed", error: args.error, updatedAt: Date.now() });
    return ctx.db.get(args.sendId);
  },
});
