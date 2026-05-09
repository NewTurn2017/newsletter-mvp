import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function normalizeEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!emailPattern.test(normalized)) throw new Error("Invalid subscriber email");
  return normalized;
}

export const list = queryGeneric({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("subscribers").order("desc").collect();
  },
});

export const listActive = queryGeneric({
  args: {},
  handler: async (ctx) => ctx.db.query("subscribers").withIndex("by_status", (q) => q.eq("status", "active")).collect(),
});

export const create = mutationGeneric({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const email = normalizeEmail(args.email);
    const existing = await ctx.db.query("subscribers").withIndex("by_email", (q) => q.eq("email", email)).unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { status: "active", updatedAt: now });
      return existing._id;
    }
    return ctx.db.insert("subscribers", { email, status: "active", createdAt: now, updatedAt: now });
  },
});

export const setStatus = mutationGeneric({
  args: { subscriberId: v.id("subscribers"), status: v.union(v.literal("active"), v.literal("unsubscribed")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.subscriberId, { status: args.status, updatedAt: Date.now() });
  },
});
