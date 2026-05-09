"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const statusLabels: Record<string, string> = { pending: "대기", sent: "성공", failed: "실패" };

export function SendStatusPanel({ articleId }: { articleId: string }) {
  const sends = useQuery(api.emailSends.listByArticle as any, { articleId: articleId as any });
  if (sends === undefined) return <p className="helper">발송 상태를 불러오는 중...</p>;
  if (!sends.length) return <p className="helper">아직 발송 기록이 없습니다.</p>;
  return (
    <div className="card stack">
      <h2>메일 발송 기록</h2>
      {sends.map((send: any) => (
        <div key={send._id} className="send-record-row">
          <span>{send.recipientEmail}</span>
          <span className="status-pill">{statusLabels[send.status] ?? send.status}</span>
          {send.error ? <span className="helper error-text">{send.error}</span> : null}
        </div>
      ))}
    </div>
  );
}
