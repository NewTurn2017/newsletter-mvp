const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return normalized.length <= 254 && emailRegex.test(normalized);
}

export function assertValidEmail(email: string): string {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) throw new Error("Invalid email address");
  return normalized;
}
