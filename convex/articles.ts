import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { slugify } from "./lib/slug";
import { hydrateStoredImageUrls, stripGeneratedImageUrls } from "../src/lib/tiptap/storageImages";
import { isTiptapDoc } from "../src/lib/tiptap/types";

type ArticleDoc = Doc<"articles">;

async function resolveArticleImages(ctx: QueryCtx, article: ArticleDoc | null) {
  if (!article) return null;
  const coverImageId = (article as { coverImageId?: Id<"_storage"> }).coverImageId;
  const legacyCoverImageUrl = (article as { coverImageUrl?: string }).coverImageUrl;
  const coverImageUrl = coverImageId ? (await ctx.storage.getUrl(coverImageId)) ?? undefined : legacyCoverImageUrl;
  const editorJson = await hydrateStoredImageUrls(article.editorJson, (storageId) => ctx.storage.getUrl(storageId as Id<"_storage">));
  return { ...article, coverImageUrl, editorJson };
}

function normalizeEditorJson(editorJson: unknown) {
  return isTiptapDoc(editorJson) ? stripGeneratedImageUrls(editorJson) : editorJson;
}

async function uniqueSlug(ctx: QueryCtx, input: string, articleId?: Id<"articles">) {
  const base = slugify(input);
  for (let suffix = 0; suffix < 100; suffix += 1) {
    const candidate = suffix === 0 ? base : `${base}-${suffix + 1}`;
    const existing = await ctx.db.query("articles").withIndex("by_slug", (q) => q.eq("slug", candidate)).unique();
    if (!existing || existing._id === articleId) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export const list = queryGeneric({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const articles = await ctx.db.query("articles").order("desc").take(100);
    return Promise.all(articles.map((article) => resolveArticleImages(ctx, article)));
  },
});

export const get = queryGeneric({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return resolveArticleImages(ctx, await ctx.db.get(args.articleId));
  },
});

export const getBySlug = queryGeneric({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db.query("articles").withIndex("by_slug", (q) => q.eq("slug", args.slug)).unique();
    return article?.status === "published" || article?.status === "sent" ? resolveArticleImages(ctx, article) : null;
  },
});

export const getPublicBySlug = queryGeneric({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db.query("articles").withIndex("by_slug", (q) => q.eq("slug", args.slug)).unique();
    return article?.status === "published" || article?.status === "sent" ? resolveArticleImages(ctx, article) : null;
  },
});

export const getForSend = queryGeneric({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    return article?.status === "published" ? resolveArticleImages(ctx, article) : null;
  },
});

export const create = mutationGeneric({
  args: {
    title: v.string(),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    editorJson: v.any(),
    coverImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    const slug = await uniqueSlug(ctx, args.slug ?? args.title);
    const articleId = await ctx.db.insert("articles", { ...args, slug, editorJson: normalizeEditorJson(args.editorJson), status: "draft", createdAt: now, updatedAt: now });
    return { articleId, slug };
  },
});

export const update = mutationGeneric({
  args: {
    articleId: v.id("articles"),
    title: v.string(),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    editorJson: v.any(),
    coverImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { articleId, ...patch } = args;
    const slug = await uniqueSlug(ctx, patch.slug ?? patch.title, articleId);
    await ctx.db.patch(articleId, { ...patch, slug, editorJson: normalizeEditorJson(patch.editorJson), updatedAt: Date.now() });
    return { slug };
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
