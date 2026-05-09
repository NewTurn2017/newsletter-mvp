import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  articles: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.optional(v.string()),
    editorJson: v.any(),
    coverImageId: v.optional(v.id("_storage")),
    coverImageUrl: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("sent")),
    publishedAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]).index("by_status", ["status"]),
  subscribers: defineTable({
    email: v.string(),
    status: v.union(v.literal("active"), v.literal("unsubscribed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]).index("by_status", ["status"]),
  emailSends: defineTable({
    articleId: v.id("articles"),
    subscriberId: v.optional(v.id("subscribers")),
    recipientEmail: v.string(),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
    providerMessageId: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.number(),
    sentAt: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_article", ["articleId"]).index("by_article_recipient", ["articleId", "recipientEmail"]),
});
