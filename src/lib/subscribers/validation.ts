export const subscriberStatuses = ["active", "unsubscribed"] as const;
export type SubscriberStatus = (typeof subscriberStatuses)[number];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return normalized.length <= 254 && emailPattern.test(normalized);
}

export function assertValidSubscriberEmail(email: string): string {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) throw new Error("Invalid email");
  return normalized;
}

export const assertValidEmail = assertValidSubscriberEmail;
