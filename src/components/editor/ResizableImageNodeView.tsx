"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useMemo, useRef } from "react";

const MIN_IMAGE_WIDTH = 120;
const MAX_IMAGE_WIDTH = 960;

function clampImageWidth(width: number) {
  return Math.min(Math.max(Math.round(width), MIN_IMAGE_WIDTH), MAX_IMAGE_WIDTH);
}

function numericWidth(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return clampImageWidth(value);
  if (typeof value === "string") {
    const parsed = Number.parseInt(value.replace("px", ""), 10);
    if (Number.isFinite(parsed)) return clampImageWidth(parsed);
  }
  return null;
}

export function ResizableImageNodeView({ node, selected, updateAttributes, editor }: NodeViewProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const width = useMemo(() => numericWidth(node.attrs.width), [node.attrs.width]);
  const alt = typeof node.attrs.alt === "string" ? node.attrs.alt : "";
  const title = typeof node.attrs.title === "string" ? node.attrs.title : undefined;
  const src = typeof node.attrs.src === "string" ? node.attrs.src : "";

  function startResize(event: React.PointerEvent<HTMLButtonElement>) {
    if (!editor.isEditable) return;
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = imageRef.current?.getBoundingClientRect().width ?? width ?? 640;

    function onPointerMove(moveEvent: PointerEvent) {
      moveEvent.preventDefault();
      updateAttributes({ width: clampImageWidth(startWidth + moveEvent.clientX - startX) });
    }

    function onPointerUp() {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
  }

  return (
    <NodeViewWrapper
      as="figure"
      className={`resizable-image-node${selected ? " is-selected" : ""}`}
      data-storage-id={typeof node.attrs.storageId === "string" ? node.attrs.storageId : undefined}
      style={{ width: width ? `${width}px` : undefined }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        title={title}
        draggable={false}
        style={{ width: width ? `${width}px` : undefined }}
      />
      {editor.isEditable ? (
        <button
          type="button"
          className="image-resize-handle"
          aria-label="이미지 크기 조절"
          title="드래그해서 이미지 크기 조절"
          onPointerDown={startResize}
        />
      ) : null}
    </NodeViewWrapper>
  );
}
