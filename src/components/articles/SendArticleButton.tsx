"use client";

import { useAction } from "convex/react";
import { useState, useTransition } from "react";
import { api } from "../../../convex/_generated/api";

export function SendArticleButton({ articleId, disabled }: { articleId: string; disabled?: boolean }) {
  const sendArticle = useAction(api.sendArticle.sendArticle as any);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="stack">
      <button
        type="button"
        disabled={disabled || isPending}
        onClick={() => {
          startTransition(async () => {
            setMessage(null);
            try {
              const result = await sendArticle({ articleId: articleId as any });
              setMessage(`Send complete: ${result.sent} sent, ${result.failed} failed, ${result.skipped} skipped.`);
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Send failed");
            }
          });
        }}
      >
        {isPending ? "Sending..." : "Send published article"}
      </button>
      {message ? <p className="helper">{message}</p> : null}
    </div>
  );
}
