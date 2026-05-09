"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function SubscriberList() {
  const subscribers = useQuery(api.subscribers.list as any);
  const setStatus = useMutation(api.subscribers.setStatus as any);
  if (subscribers === undefined) return <p className="helper">Loading subscribers...</p>;
  if (!subscribers.length) return <p className="helper">No subscribers yet.</p>;
  return (
    <div className="card stack">
      <h2>Subscribers</h2>
      {subscribers.map((subscriber: any) => (
        <div key={subscriber._id} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span>{subscriber.email}</span>
          <span className="status-pill">{subscriber.status}</span>
          <button
            className="secondary"
            type="button"
            onClick={() => setStatus({ subscriberId: subscriber._id, status: subscriber.status === "active" ? "unsubscribed" : "active" })}
          >
            {subscriber.status === "active" ? "Unsubscribe" : "Reactivate"}
          </button>
        </div>
      ))}
    </div>
  );
}
