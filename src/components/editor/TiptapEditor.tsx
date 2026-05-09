"use client";

import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import { useEffect } from "react";
import { newsletterTiptapExtensions } from "@/lib/tiptap/schema";
import { emptyTiptapDoc, type TiptapDoc } from "@/lib/tiptap/types";
import { ImageUrlInsertControl } from "./ImageUrlInsertControl";

export function TiptapEditor({ value, onChange }: { value: TiptapDoc; onChange: (value: TiptapDoc) => void }) {
  const editor = useEditor({
    extensions: newsletterTiptapExtensions,
    content: value as JSONContent,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => onChange(current.getJSON() as TiptapDoc),
    editorProps: { attributes: { class: "article-body" } },
  });

  useEffect(() => {
    if (editor && value && JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) {
      editor.commands.setContent(value as JSONContent);
    }
  }, [editor, value]);

  return (
    <div className="editor-shell">
      <div className="editor-toolbar">
        <button type="button" className="secondary" onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</button>
        <button type="button" className="secondary" onClick={() => editor?.chain().focus().toggleItalic().run()}>Italic</button>
        <button type="button" className="secondary" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>Heading</button>
        <button type="button" className="secondary" onClick={() => editor?.chain().focus().toggleBulletList().run()}>Bullets</button>
        <button type="button" className="secondary" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>Numbers</button>
        <button type="button" className="secondary" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>Quote</button>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            const href = window.prompt("Link URL");
            if (href) editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
          }}
        >Link</button>
        <button type="button" className="secondary" onClick={() => editor?.commands.setContent(emptyTiptapDoc as JSONContent)}>Clear</button>
        <ImageUrlInsertControl editor={editor} />
      </div>
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
