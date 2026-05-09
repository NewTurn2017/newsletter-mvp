"use client";

import type { Editor } from "@tiptap/react";
import { useRef } from "react";
import { useConvexImageUpload } from "./useConvexImageUpload";

export function ImageUploadInsertControl({ editor }: { editor: Editor | null }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { uploadImages, isUploading, uploadError } = useConvexImageUpload();

  async function insertFiles(files: FileList | File[]) {
    if (!editor) return;
    const uploaded = await uploadImages(files);
    for (const image of uploaded) {
      editor.chain().focus().setImage({ src: image.url, alt: image.name, title: image.name, storageId: image.storageId } as any).run();
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="editor-upload-control">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        aria-label="본문 이미지 파일 선택"
        onChange={(event) => {
          if (event.target.files) void insertFiles(event.target.files);
        }}
      />
      <button type="button" className="secondary" disabled={!editor || isUploading} onClick={() => inputRef.current?.click()} title="이미지 업로드">
        🖼️ 이미지
      </button>
      {isUploading ? <span className="helper">이미지 업로드 중...</span> : null}
      {uploadError ? <span className="helper error-text">{uploadError}</span> : null}
    </div>
  );
}
