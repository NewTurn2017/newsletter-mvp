export type EmailSendStatus = "pending" | "sent" | "failed";

export type ExistingEmailSend = {
  status: EmailSendStatus;
};

export function shouldCreatePendingSend(existing: ExistingEmailSend | null | undefined): boolean {
  if (!existing) return true;
  return existing.status === "failed";
}

export function shouldCallProvider(existing: ExistingEmailSend | null | undefined): boolean {
  if (!existing) return true;
  return existing.status === "failed";
}

export function canSendArticle(status: string): boolean {
  return status === "published";
}
