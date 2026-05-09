import { v } from "convex/values";
import { action } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { slugify } from "./lib/slug";
import { tiptapToPlainText } from "../src/lib/render/tiptapToPlainText";

const OPENAI_MODEL = "gpt-5.4-nano";

type OpenAITextOutput = {
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  output_text?: string;
};

function extractOutputText(response: OpenAITextOutput) {
  if (typeof response.output_text === "string") return response.output_text;
  return response.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text" && typeof content.text === "string")
    ?.text;
}

function parseJsonObject(text: string | undefined): Record<string, unknown> | null {
  if (!text) return null;
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function parseSlugResponse(text: string | undefined, title: string) {
  const parsed = parseJsonObject(text);
  if (typeof parsed?.slug === "string") return slugify(parsed.slug);
  if (text) return slugify(text);
  return slugify(title);
}

function normalizeSummary(summary: string) {
  return summary
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join("\n")
    .slice(0, 220)
    .trim();
}

function fallbackSummary(title: string, plainText: string) {
  const source = plainText.trim() || title.trim();
  const compact = source.replace(/\s+/g, " ").trim();
  if (compact.length <= 110) return compact;
  const sentenceParts = compact.match(/[^.!?。！？]+[.!?。！？]?/g) ?? [compact];
  const selected = sentenceParts.slice(0, 2).join(" ").trim();
  return normalizeSummary(selected.length > 30 ? selected : compact.slice(0, 160));
}

function parseSummaryResponse(text: string | undefined, title: string, plainText: string) {
  const parsed = parseJsonObject(text);
  if (typeof parsed?.summary === "string") {
    const summary = normalizeSummary(parsed.summary);
    if (summary) return summary;
  }
  return fallbackSummary(title, plainText);
}

async function createOpenAIResponse(apiKey: string, body: unknown) {
  return fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export const generateArticleSlug = action({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const title = args.title.trim();
    if (!title) throw new Error("제목을 입력해주세요.");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { slug: slugify(title), provider: "fallback" as const };

    const response = await createOpenAIResponse(apiKey, {
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: "You create short, SEO-friendly URL slugs for Korean newsletter/blog titles. Return only JSON matching the schema. Use lowercase English words when natural, romanize Korean compactly, use hyphens, no dates unless the title needs it, no emojis.",
        },
        {
          role: "user",
          content: `Create one URL slug for this title: ${title}`,
        },
      ],
      max_output_tokens: 80,
      text: {
        format: {
          type: "json_schema",
          name: "article_slug",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              slug: {
                type: "string",
                description: "URL-safe slug using lowercase letters, numbers, Korean characters if needed, and hyphens only.",
              },
            },
            required: ["slug"],
          },
        },
      },
    });

    if (!response.ok) return { slug: slugify(title), provider: "fallback" as const };
    const json = (await response.json()) as OpenAITextOutput;
    return { slug: parseSlugResponse(extractOutputText(json), title), provider: "openai" as const };
  },
});

export const generateArticleSummary = action({
  args: { title: v.string(), editorJson: v.any() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const title = args.title.trim();
    const plainText = tiptapToPlainText(args.editorJson);
    if (!title && !plainText) throw new Error("요약할 제목이나 본문이 필요합니다.");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { summary: fallbackSummary(title, plainText), provider: "fallback" as const };

    const response = await createOpenAIResponse(apiKey, {
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: "You write concise Korean article summaries for newsletter previews. Return only JSON matching the schema. The summary must be exactly one or two natural Korean lines, faithful to the body, no markdown, no emojis, no invented facts.",
        },
        {
          role: "user",
          content: `제목: ${title || "제목 없음"}\n\n본문:\n${plainText.slice(0, 8000)}\n\n본문에 맞는 두 줄 내외의 요약을 작성하세요.`,
        },
      ],
      max_output_tokens: 180,
      text: {
        format: {
          type: "json_schema",
          name: "article_summary",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: {
                type: "string",
                description: "A faithful Korean summary for the article, one or two short lines, no markdown.",
              },
            },
            required: ["summary"],
          },
        },
      },
    });

    if (!response.ok) return { summary: fallbackSummary(title, plainText), provider: "fallback" as const };
    const json = (await response.json()) as OpenAITextOutput;
    return { summary: parseSummaryResponse(extractOutputText(json), title, plainText), provider: "openai" as const };
  },
});
