import { describe, expect, it } from "vitest";
import { canSendArticle, shouldCallProvider, shouldCreatePendingSend } from "@/lib/send/idempotency";

describe("send idempotency helpers", () => {
  it("creates a pending send only for missing or failed prior records", () => {
    expect(shouldCreatePendingSend(undefined)).toBe(true);
    expect(shouldCreatePendingSend({ status: "failed" })).toBe(true);
    expect(shouldCreatePendingSend({ status: "pending" })).toBe(false);
    expect(shouldCreatePendingSend({ status: "sent" })).toBe(false);
  });

  it("calls provider only for missing or failed records", () => {
    expect(shouldCallProvider(null)).toBe(true);
    expect(shouldCallProvider({ status: "failed" })).toBe(true);
    expect(shouldCallProvider({ status: "pending" })).toBe(false);
    expect(shouldCallProvider({ status: "sent" })).toBe(false);
  });

  it("keeps send eligibility constrained to published articles", () => {
    expect(canSendArticle("draft")).toBe(false);
    expect(canSendArticle("published")).toBe(true);
    expect(canSendArticle("sent")).toBe(false);
  });
});
