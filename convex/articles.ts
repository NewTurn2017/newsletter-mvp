import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/auth";

export const list = queryGeneric({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("articles").order("desc").collect();
  },
});


export const get = queryGeneric({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.get(args.articleId);
  },
});

export const getBySlug = queryGeneric({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db.query("articles").withIndex("by_slug", (q) => q.eq("slug", args.slug)).unique();
    return article?.status === "published" || article?.status === "sent" ? article : null;
  },
});

export const getPublicBySlug = queryGeneric({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db.query("articles").withIndex("by_slug", (q) => q.eq("slug", args.slug)).unique();
    return article?.status === "published" || article?.status === "sent" ? article : null;
  },
});

export const getForSend = queryGeneric({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    return article?.status === "published" ? article : null;
  },
});

export const create = mutationGeneric({
  args: { title: v.string(), slug: v.string(), excerpt: v.optional(v.string()), editorJson: v.any(), coverImageUrl: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    return ctx.db.insert("articles", { ...args, status: "draft", createdAt: now, updatedAt: now });
  },
});

export const update = mutationGeneric({
  args: { articleId: v.id("articles"), title: v.string(), slug: v.string(), excerpt: v.optional(v.string()), editorJson: v.any(), coverImageUrl: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { articleId, ...patch } = args;
    await ctx.db.patch(articleId, { ...patch, updatedAt: Date.now() });
  },
});

export const publish = mutationGeneric({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    await ctx.db.patch(args.articleId, { status: "published", publishedAt: now, updatedAt: now });
  },
});

export const markSent = mutationGeneric({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    await ctx.db.patch(args.articleId, { status: "sent", sentAt: now, updatedAt: now });
  },
});
