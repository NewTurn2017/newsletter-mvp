import { describe, expect, it } from "vitest";
import { renderArticleEmail } from "@/lib/email/renderArticleEmail";
import { sendArticleWorkflow, type EmailSendRecord, type SubscriberForSend } from "@/lib/email/sendArticleWorkflow";
import { shouldCallProvider, shouldCreatePendingSend } from "@/lib/send/idempotency";
import type { TiptapDoc } from "@/lib/tiptap/types";

const doc: TiptapDoc = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Launch" }] },
    { type: "paragraph", content: [{ type: "text", text: "Published body" }] },
  ],
};

describe("send flow contract", () => {
  it("creates pending only for new or failed article-recipient records", () => {
    expect(shouldCreatePendingSend(undefined)).toBe(true);
    expect(shouldCallProvider(undefined)).toBe(true);
    expect(shouldCreatePendingSend({ status: "failed" })).toBe(true);
    expect(shouldCallProvider({ status: "failed" })).toBe(true);
    expect(shouldCreatePendingSend({ status: "pending" })).toBe(false);
    expect(shouldCallProvider({ status: "sent" })).toBe(false);
  });

  it("renders payload shape expected by Resend calls", () => {
    const email = renderArticleEmail({ title: "Launch", editorJson: doc, publicUrl: "https://app.test/articles/launch" });
    expect(email.subject).toBe("Launch");
    expect(email.html).toContain("<article>");
    expect(email.text).toContain("Published body");
    expect(email.text).toContain("https://app.test/articles/launch");
  });

  it("rejects unpublished articles before provider calls", async () => {
    let providerCalls = 0;
    await expect(
      sendArticleWorkflow(
        {
          getArticle: async () => ({ _id: "article-1", title: "Draft", slug: "draft", editorJson: doc, status: "draft" }),
          listActiveSubscribers: async () => [{ _id: "sub-1", email: "a@example.com" }],
          findExistingSend: async () => null,
          ensurePendingSend: async () => "send-1",
          sendEmail: async () => {
            providerCalls += 1;
            return { id: "provider-1" };
          },
          markSent: async () => undefined,
          markFailed: async () => undefined,
          markArticleSent: async () => undefined,
        },
        "https://app.test",
      ),
    ).rejects.toThrow("Only published articles can be sent");
    expect(providerCalls).toBe(0);
  });

  it("creates pending before provider, skips sent/pending duplicates, records failures, and marks article sent", async () => {
    const existingByEmail = new Map<string, EmailSendRecord | null>([
      ["already@example.com", { _id: "send-sent", status: "sent" }],
      ["pending@example.com", { _id: "send-pending", status: "pending" }],
      ["retry@example.com", { _id: "send-failed", status: "failed" }],
      ["fail@example.com", null],
    ]);
    const subscribers: SubscriberForSend[] = [
      { _id: "sub-1", email: "new@example.com" },
      { _id: "sub-2", email: "already@example.com" },
      { _id: "sub-3", email: "pending@example.com" },
      { _id: "sub-4", email: "retry@example.com" },
      { _id: "sub-5", email: "fail@example.com" },
    ];
    const events: string[] = [];
    const result = await sendArticleWorkflow(
      {
        getArticle: async () => ({ _id: "article-1", title: "Launch", slug: "launch", editorJson: doc, status: "published" }),
        listActiveSubscribers: async () => subscribers,
        findExistingSend: async (subscriber) => existingByEmail.get(subscriber.email) ?? null,
        ensurePendingSend: async (subscriber) => {
          events.push(`pending:${subscriber.email}`);
          return `send:${subscriber.email}`;
        },
        sendEmail: async (input) => {
          events.push(`provider:${input.to}`);
          if (input.to === "fail@example.com") throw new Error("provider down");
          return { id: `provider:${input.to}` };
        },
        markSent: async (sendId, providerMessageId) => {
          events.push(`sent:${sendId}:${providerMessageId}`);
        },
        markFailed: async (sendId, error) => {
          events.push(`failed:${sendId}:${error}`);
        },
        markArticleSent: async () => {
          events.push("article:sent");
        },
      },
      "https://app.test/",
    );

    expect(result).toEqual({ attempted: 3, sent: 2, failed: 1, skipped: 2 });
    expect(events).toEqual([
      "pending:new@example.com",
      "provider:new@example.com",
      "sent:send:new@example.com:provider:new@example.com",
      "pending:retry@example.com",
      "provider:retry@example.com",
      "sent:send:retry@example.com:provider:retry@example.com",
      "pending:fail@example.com",
      "provider:fail@example.com",
      "failed:send:fail@example.com:provider down",
      "article:sent",
    ]);
  });
});
