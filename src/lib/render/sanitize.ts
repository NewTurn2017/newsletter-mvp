const allowedProtocols = new Set(["http:", "https:", "mailto:"]);

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function safeUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  try {
    const url = new URL(value);
    return allowedProtocols.has(url.protocol) ? url.toString() : null;
  } catch {
    if (value.startsWith("/")) return value;
    return null;
  }
}

export function safeImageUrl(value: unknown): string | null {
  const url = safeUrl(value);
  if (!url || url.startsWith("mailto:")) return null;
  return url;
}
