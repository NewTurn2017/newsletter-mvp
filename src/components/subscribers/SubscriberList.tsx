"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const statusLabels: Record<string, string> = { active: "활성", unsubscribed: "구독 해지" };

export function SubscriberList() {
  const subscribers = useQuery(api.subscribers.list as any);
  const setStatus = useMutation(api.subscribers.setStatus as any);
  if (subscribers === undefined) return <p className="helper">구독자를 불러오는 중...</p>;
  if (!subscribers.length) return <p className="helper">아직 구독자가 없습니다.</p>;
  return (
    <div className="card stack">
      <h2>구독자</h2>
      {subscribers.map((subscriber: any) => (
        <div key={subscriber._id} className="send-record-row">
          <span>{subscriber.email}</span>
          <span className="status-pill">{statusLabels[subscriber.status] ?? subscriber.status}</span>
          <button
            className="secondary"
            type="button"
            onClick={() => setStatus({ subscriberId: subscriber._id, status: subscriber.status === "active" ? "unsubscribed" : "active" })}
          >
            {subscriber.status === "active" ? "구독 해지" : "다시 활성화"}
          </button>
        </div>
      ))}
    </div>
  );
}
