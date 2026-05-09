"use client";

import { useMutation } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "../../../convex/_generated/api";

export type UploadedImage = {
  storageId: string;
  url: string;
  name: string;
};

function assertImageFile(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("이미지 파일만 업로드할 수 있습니다.");
}

export function useConvexImageUpload() {
  const generateUploadUrl = useMutation(api.files.generateImageUploadUrl as any);
  const resolveImageUrl = useMutation(api.files.resolveImageUrl as any);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File): Promise<UploadedImage> => {
    assertImageFile(file);
    setIsUploading(true);
    setUploadError(null);
    try {
      const uploadUrl = await generateUploadUrl({});
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!response.ok) throw new Error(`이미지 업로드 실패 (${response.status})`);
      const { storageId } = (await response.json()) as { storageId?: string };
      if (!storageId) throw new Error("Convex 스토리지 ID를 받지 못했습니다.");
      const url = await resolveImageUrl({ storageId: storageId as any });
      if (!url) throw new Error("업로드한 이미지 URL을 만들 수 없습니다.");
      return { storageId, url, name: file.name };
    } catch (error) {
      const message = error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.";
      setUploadError(message);
      throw new Error(message, { cause: error });
    } finally {
      setIsUploading(false);
    }
  }, [generateUploadUrl, resolveImageUrl]);

  const uploadImages = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return [];
    const uploaded: UploadedImage[] = [];
    for (const file of imageFiles) uploaded.push(await uploadImage(file));
    return uploaded;
  }, [uploadImage]);

  return { uploadImage, uploadImages, isUploading, uploadError, setUploadError };
}
