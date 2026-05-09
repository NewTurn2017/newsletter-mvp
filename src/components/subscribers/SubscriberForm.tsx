"use client";

import { useMutation } from "convex/react";
import { useState, useTransition } from "react";
import { api } from "../../../convex/_generated/api";
import { isValidEmail, normalizeEmail } from "@/lib/subscribers/validation";

export function SubscriberForm() {
  const createSubscriber = useMutation(api.subscribers.create as any);
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
          setMessage("Enter a valid email address.");
          return;
        }
        startTransition(async () => {
          try {
            await createSubscriber({ email: normalized });
            setEmail("");
            setMessage("Subscriber saved.");
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to save subscriber");
          }
        });
      }}
    >
      <h2>Add active subscriber</h2>
      <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="reader@example.com" /></label>
      <button disabled={isPending || !isValidEmail(normalized)}>{isPending ? "Saving..." : "Add subscriber"}</button>
      {message ? <p className="helper">{message}</p> : null}
    </form>
  );
}
