"use client";

import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import { useEffect } from "react";
import { newsletterTiptapExtensions } from "@/lib/tiptap/schema";
import { emptyTiptapDoc, type TiptapDoc } from "@/lib/tiptap/types";
import { ImageUploadInsertControl } from "./ImageUploadInsertControl";
import { useConvexImageUpload } from "./useConvexImageUpload";

function ToolbarButton({ active, children, title, onClick }: { active?: boolean; children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button type="button" className={`secondary toolbar-button${active ? " is-active" : ""}`} onClick={onClick} title={title} aria-label={title}>
      {children}
    </button>
  );
}

export function TiptapEditor({ value, onChange }: { value: TiptapDoc; onChange: (value: TiptapDoc) => void }) {
  const { uploadImages, isUploading, uploadError } = useConvexImageUpload();

  const editor = useEditor({
    extensions: newsletterTiptapExtensions,
    content: value as JSONContent,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => onChange(current.getJSON() as TiptapDoc),
    editorProps: {
      attributes: { class: "article-body", "aria-label": "뉴스레터 본문 편집기" },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
        if (imageFiles.length === 0) return false;
        event.preventDefault();
        void uploadImages(imageFiles).then((images) => {
          for (const image of images) {
            editor?.chain().focus().setImage({ src: image.url, alt: image.name, title: image.name, storageId: image.storageId } as any).run();
          }
        });
        return true;
      },
      handlePaste: (_view, event) => {
        const files = event.clipboardData?.files;
        if (!files || files.length === 0) return false;
        const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
        if (imageFiles.length === 0) return false;
        event.preventDefault();
        void uploadImages(imageFiles).then((images) => {
          for (const image of images) {
            editor?.chain().focus().setImage({ src: image.url, alt: image.name, title: image.name, storageId: image.storageId } as any).run();
          }
        });
        return true;
      },
    },
  });

  useEffect(() => {
    if (editor && value && JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) {
      editor.commands.setContent(value as JSONContent);
    }
  }, [editor, value]);

  return (
    <div className="editor-shell">
      <div className="editor-toolbar" aria-label="본문 서식 도구">
        <ToolbarButton active={editor?.isActive("bold")} title="굵게" onClick={() => editor?.chain().focus().toggleBold().run()}>𝐁</ToolbarButton>
        <ToolbarButton active={editor?.isActive("italic")} title="이탤릭" onClick={() => editor?.chain().focus().toggleItalic().run()}>𝑰</ToolbarButton>
        <ToolbarButton active={editor?.isActive("heading", { level: 1 })} title="큰 제목" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>H1</ToolbarButton>
        <ToolbarButton active={editor?.isActive("heading", { level: 2 })} title="중간 제목" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton active={editor?.isActive("heading", { level: 3 })} title="작은 제목" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
        <ToolbarButton active={editor?.isActive("paragraph")} title="본문 크기" onClick={() => editor?.chain().focus().setParagraph().run()}>¶</ToolbarButton>
        <ToolbarButton active={editor?.isActive("bulletList")} title="글머리 목록" onClick={() => editor?.chain().focus().toggleBulletList().run()}>• 목록</ToolbarButton>
        <ToolbarButton active={editor?.isActive("orderedList")} title="번호 목록" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. 목록</ToolbarButton>
        <ToolbarButton active={editor?.isActive("blockquote")} title="인용/강조 박스" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>❝</ToolbarButton>
        <ToolbarButton
          title="요약 박스 넣기"
          onClick={() => editor?.chain().focus().insertContent({ type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "요약: " }] }] }).run()}
        >📝 요약</ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("link")}
          title="링크"
          onClick={() => {
            const href = window.prompt("링크 주소를 입력하세요");
            if (href) editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
          }}
        >🔗</ToolbarButton>
        <ToolbarButton title="서식 지우기" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}>⌫</ToolbarButton>
        <ToolbarButton title="전체 비우기" onClick={() => editor?.commands.setContent(emptyTiptapDoc as JSONContent)}>초기화</ToolbarButton>
        <ImageUploadInsertControl editor={editor} />
      </div>
      <div className="editor-drop-hint">이미지 파일을 이 영역에 드래그 앤 드롭하거나 붙여넣으면 Convex Storage에 업로드됩니다.</div>
      {isUploading ? <p className="helper editor-status">이미지 업로드 중...</p> : null}
      {uploadError ? <p className="helper error-text editor-status">{uploadError}</p> : null}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
