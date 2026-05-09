"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { api } from "../../../convex/_generated/api";
import { ArticleToolbar } from "./ArticleToolbar";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { slugify } from "@/lib/slug";
import { emptyTiptapDoc, isTiptapDoc, type TiptapDoc } from "@/lib/tiptap/types";

export type EditableArticle = {
  _id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImageUrl?: string;
  editorJson: unknown;
  status?: "draft" | "published" | "sent";
};

export function ArticleForm({ article }: { article?: EditableArticle | null }) {
  const router = useRouter();
  const createArticle = useMutation(api.articles.create as any);
  const updateArticle = useMutation(api.articles.update as any);
  const publishArticle = useMutation(api.articles.publish as any);
  const [isPending, startTransition] = useTransition();
  const initialDoc = useMemo(() => (isTiptapDoc(article?.editorJson) ? article.editorJson : emptyTiptapDoc), [article?.editorJson]);
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(article?.coverImageUrl ?? "");
  const [editorJson, setEditorJson] = useState<TiptapDoc>(initialDoc);
  const [message, setMessage] = useState<string | null>(null);
  const articleId = article?._id;

  function persist({ publish = false }: { publish?: boolean } = {}) {
    startTransition(async () => {
      setMessage(null);
      try {
        const nextSlug = slug || slugify(title);
        if (!title.trim()) throw new Error("Title is required");
        const payload = { title, slug: nextSlug, excerpt: excerpt || undefined, coverImageUrl: coverImageUrl || undefined, editorJson };
        const id = articleId
          ? await updateArticle({ articleId: articleId as any, ...payload })
          : await createArticle(payload);
        if (publish) await publishArticle({ articleId: (articleId ?? id) as any });
        setSlug(nextSlug);
        setMessage(publish ? "Published." : "Draft saved.");
        if (!articleId) router.replace(`/admin/articles/${id}/edit`);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to save article");
      }
    });
  }

  return (
    <section className="card stack">
      <ArticleToolbar articleId={articleId} slug={slug} status={article?.status} />
      <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} onBlur={() => !slug && setSlug(slugify(title))} placeholder="A useful newsletter title" /></label>
      <label>Slug<input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} placeholder="useful-newsletter-title" /></label>
      <label>Excerpt<textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="Short summary for previews and email intro" rows={3} /></label>
      <label>Cover image URL (optional)<input value={coverImageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} placeholder="https://..." /></label>
      <TiptapEditor value={editorJson} onChange={setEditorJson} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" disabled={isPending} onClick={() => persist()}>{isPending ? "Saving..." : "Save draft"}</button>
        <button type="button" disabled={isPending || !articleId} className="secondary" onClick={() => persist({ publish: true })}>Publish</button>
      </div>
      {message ? <p className="helper">{message}</p> : null}
    </section>
  );
}
