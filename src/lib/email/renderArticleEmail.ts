import { tiptapToHtml } from "@/lib/render/tiptapToHtml";
import { tiptapToPlainText } from "@/lib/render/tiptapToPlainText";
import { escapeHtml } from "@/lib/render/sanitize";

export type RenderEmailInput = {
  title: string;
  excerpt?: string;
  editorJson: unknown;
  publicUrl: string;
};

export function renderArticleEmail(input: RenderEmailInput) {
  const subject = input.title.trim();
  if (subject.length === 0) throw new Error("Email title is required");
  const articleHtml = tiptapToHtml(input.editorJson);
  const articleText = tiptapToPlainText(input.editorJson);
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#172033;max-width:680px;margin:0 auto;padding:24px;">
<h1>${escapeHtml(subject)}</h1>
${input.excerpt ? `<p style="color:#5f6b7a;">${escapeHtml(input.excerpt)}</p>` : ""}
<article>${articleHtml}</article>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
<p><a href="${escapeHtml(input.publicUrl)}">Read on the web</a></p>
</body></html>`;
  const text = `${subject}\n\n${input.excerpt ? `${input.excerpt}\n\n` : ""}${articleText}\n\nRead on the web: ${input.publicUrl}`;
  return { subject, html, text };
}
