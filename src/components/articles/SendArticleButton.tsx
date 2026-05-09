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
              setMessage(`발송 완료: 성공 ${result.sent}명, 실패 ${result.failed}명, 건너뜀 ${result.skipped}명`);
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "메일 발송에 실패했습니다.");
            }
          });
        }}
      >
        {isPending ? "발송 중..." : "공개 글 메일 발송"}
      </button>
      {message ? <p className="helper">{message}</p> : null}
    </div>
  );
}
