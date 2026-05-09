import { Resend } from "resend";

export async function sendNewsletterEmail(input: { to: string; subject: string; html: string; text: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "Newsletter <onboarding@resend.dev>";
  if (!apiKey || process.env.RESEND_MOCK === "1") return { id: `mock_${Date.now()}` };
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({ from, ...input });
  if (result.error) throw new Error(result.error.message);
  if (!result.data?.id) throw new Error("Resend did not return a message id");
  return { id: result.data.id };
}
