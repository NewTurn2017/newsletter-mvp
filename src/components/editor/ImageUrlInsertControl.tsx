"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ImageUrlInsertControl({ editor }: { editor: Editor | null }) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!editor || !isHttpUrl(url)) return;
        editor.chain().focus().setImage({ src: url, alt }).run();
        setUrl("");
        setAlt("");
      }}
      style={{ display: "flex", gap: 8, flexWrap: "wrap", width: "100%" }}
    >
      <input aria-label="Image URL" placeholder="https://image.example/photo.jpg" value={url} onChange={(event) => setUrl(event.target.value)} style={{ flex: "1 1 260px" }} />
      <input aria-label="Image alt text" placeholder="Alt text" value={alt} onChange={(event) => setAlt(event.target.value)} style={{ flex: "1 1 160px" }} />
      <button type="submit" className="secondary" disabled={!editor || !isHttpUrl(url)}>Insert image URL</button>
    </form>
  );
}
