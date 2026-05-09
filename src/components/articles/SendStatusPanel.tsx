"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function SendStatusPanel({ articleId }: { articleId: string }) {
  const sends = useQuery(api.emailSends.listByArticle as any, { articleId: articleId as any });
  if (sends === undefined) return <p className="helper">Loading send status...</p>;
  if (!sends.length) return <p className="helper">No send records yet.</p>;
  return (
    <div className="card stack">
      <h2>Email send records</h2>
      {sends.map((send: any) => (
        <div key={send._id} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span>{send.recipientEmail}</span>
          <span className="status-pill">{send.status}</span>
          {send.error ? <span className="helper">{send.error}</span> : null}
        </div>
      ))}
    </div>
  );
}
