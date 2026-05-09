import { Blockquote } from "@tiptap/extension-blockquote";
import { Bold } from "@tiptap/extension-bold";
import { BulletList } from "@tiptap/extension-bullet-list";
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Heading } from "@tiptap/extension-heading";
import { Image } from "@tiptap/extension-image";
import { Italic } from "@tiptap/extension-italic";
import { Link } from "@tiptap/extension-link";
import { ListItem } from "@tiptap/extension-list-item";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableImageNodeView } from "../../components/editor/ResizableImageNodeView";
export { isTiptapDoc } from "../render/tiptapTypes";

function parseImageWidth(element: HTMLElement) {
  const width = element.getAttribute("width") ?? element.style.width;
  if (!width) return null;
  const parsed = Number.parseInt(width.replace("px", ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

const StoredImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      storageId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-storage-id"),
        renderHTML: (attributes) => attributes.storageId ? { "data-storage-id": attributes.storageId } : {},
      },
      width: {
        default: null,
        parseHTML: parseImageWidth,
        renderHTML: (attributes) => attributes.width ? { width: attributes.width, style: `width:${attributes.width}px;max-width:100%;height:auto;` } : {},
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView);
  },
});

export const newsletterTiptapExtensions = [
  Document,
  Paragraph,
  Text,
  Bold,
  Italic,
  Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
  Heading.configure({ levels: [1, 2, 3] }),
  BulletList,
  OrderedList,
  ListItem,
  Blockquote,
  HardBreak,
  StoredImage.configure({ inline: false, allowBase64: false }),
];
