"use client";

import { useMutation } from "convex/react";
import { useState, useTransition } from "react";
import { api } from "../../../convex/_generated/api";
import { isValidEmail, normalizeEmail } from "@/lib/subscribers/validation";

export function SubscriberForm() {
  const subscribe = useMutation(api.subscribers.subscribe as any);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const normalized = normalizeEmail(email);

  return (
    <form
      className="card stack"
      onSubmit={(event) => {
        event.preventDefault();
        if (!isValidEmail(normalized)) {
          setMessage("올바른 이메일 주소를 입력해주세요.");
          return;
        }
        startTransition(async () => {
          try {
            await subscribe({ email: normalized });
            setEmail("");
            setMessage("구독 신청이 완료되었습니다.");
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "구독 신청을 완료할 수 없습니다.");
          }
        });
      }}
    >
      <h2>뉴스레터 구독하기</h2>
      <label>이메일<input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
      <button disabled={isPending || !isValidEmail(normalized)}>{isPending ? "신청 중..." : "뉴스레터 구독"}</button>
      {message ? <p className="helper">{message}</p> : null}
    </form>
  );
}
