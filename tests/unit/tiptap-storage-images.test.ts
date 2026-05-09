import { describe, expect, it } from "vitest";
import { hydrateStoredImageUrls, stripGeneratedImageUrls } from "@/lib/tiptap/storageImages";
import type { TiptapDoc } from "@/lib/tiptap/types";

const doc: TiptapDoc = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "본문" }] },
    { type: "image", attrs: { storageId: "storage_123", src: "https://generated.example/image.png", alt: "업로드 이미지", width: 420 } },
  ],
};

describe("Tiptap stored images", () => {
  it("stores uploaded images by storage id, not generated URL", () => {
    const stripped = stripGeneratedImageUrls(doc);
    expect(stripped.content?.[1].attrs).toEqual({ storageId: "storage_123", alt: "업로드 이미지", width: 420 });
  });

  it("hydrates storage ids to temporary serving URLs for editing and rendering", async () => {
    const hydrated = await hydrateStoredImageUrls(stripGeneratedImageUrls(doc), async (storageId) => `https://files.example/${storageId}`) as TiptapDoc;
    expect(hydrated.content?.[1].attrs?.storageId).toBe("storage_123");
    expect(hydrated.content?.[1].attrs?.src).toBe("https://files.example/storage_123");
    expect(hydrated.content?.[1].attrs?.width).toBe(420);
  });
});
