"use client";

import { useRef, useState, type DragEvent } from "react";
import { useConvexImageUpload } from "@/components/editor/useConvexImageUpload";

export function CoverImageUploader({
  imageUrl,
  onChange,
}: {
  imageUrl?: string;
  onChange: (image: { storageId: string; url: string } | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadImage, isUploading, uploadError } = useConvexImageUpload();

  async function upload(file: File) {
    const image = await uploadImage(file);
    onChange({ storageId: image.storageId, url: image.url });
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = Array.from(event.dataTransfer.files).find((candidate) => candidate.type.startsWith("image/"));
    if (file) void upload(file);
  }

  return (
    <section className="stack">
      <div
        className={`dropzone${isDragging ? " is-dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {imageUrl ? <img src={imageUrl} alt="커버 미리보기" className="cover-preview" /> : <div className="dropzone-placeholder">커버 이미지를 끌어다 놓거나 파일을 선택하세요.</div>}
        <div className="row">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="커버 이미지 파일 선택"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.currentTarget.value = "";
            }}
          />
          <button type="button" className="secondary" disabled={isUploading} onClick={() => inputRef.current?.click()}>
            {isUploading ? "업로드 중..." : "커버 이미지 선택"}
          </button>
          {imageUrl ? <button type="button" className="secondary" onClick={() => onChange(null)}>커버 제거</button> : null}
        </div>
      </div>
      {uploadError ? <p className="helper error-text">{uploadError}</p> : null}
      <p className="helper">이미지는 Convex Storage에 저장되고, 글 데이터에는 이미지 ID만 저장됩니다.</p>
    </section>
  );
}
