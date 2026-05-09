"use client";

import { useAction, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { api } from "../../../convex/_generated/api";
import { ArticleToolbar } from "./ArticleToolbar";
import { CoverImageUploader } from "./CoverImageUploader";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { slugify } from "@/lib/slug";
import { emptyTiptapDoc, isTiptapDoc, type TiptapDoc } from "@/lib/tiptap/types";

export type EditableArticle = {
  _id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImageId?: string;
  coverImageUrl?: string;
  editorJson: unknown;
  status?: "draft" | "published" | "sent";
};

export function ArticleForm({ article }: { article?: EditableArticle | null }) {
  const router = useRouter();
  const createArticle = useMutation(api.articles.create as any);
  const updateArticle = useMutation(api.articles.update as any);
  const publishArticle = useMutation(api.articles.publish as any);
  const generateArticleSlug = useAction(api.aiSlug.generateArticleSlug as any);
  const generateArticleSummary = useAction(api.aiSlug.generateArticleSummary as any);
  const [isPending, startTransition] = useTransition();
  const initialDoc = useMemo(() => (isTiptapDoc(article?.editorJson) ? article.editorJson : emptyTiptapDoc), [article?.editorJson]);
  const [title, setTitle] = useState(article?.title ?? "");
  const [publicSlug, setPublicSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [coverImageId, setCoverImageId] = useState(article?.coverImageId ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(article?.coverImageUrl ?? "");
  const [editorJson, setEditorJson] = useState<TiptapDoc>(initialDoc);
  const [message, setMessage] = useState<string | null>(null);
  const articleId = article?._id;

  async function resolveSlug() {
    if ((article?.status === "published" || article?.status === "sent") && publicSlug) return publicSlug;
    try {
      const result = await generateArticleSlug({ title });
      return result?.slug || slugify(title);
    } catch {
      return slugify(title);
    }
  }

  async function resolveExcerpt() {
    try {
      const result = await generateArticleSummary({ title, editorJson });
      return result?.summary || excerpt || undefined;
    } catch {
      return excerpt || undefined;
    }
  }

  function persist({ publish = false }: { publish?: boolean } = {}) {
    startTransition(async () => {
      setMessage(null);
      try {
        if (!title.trim()) throw new Error("제목을 입력해주세요.");
        const nextSlug = await resolveSlug();
        const nextExcerpt = await resolveExcerpt();
        const payload = { title, slug: nextSlug, excerpt: nextExcerpt, coverImageId: coverImageId || undefined, editorJson };
        const result = articleId
          ? await updateArticle({ articleId: articleId as any, ...payload })
          : await createArticle(payload);
        const savedArticleId = articleId ?? result.articleId;
        const savedSlug = result.slug ?? nextSlug;
        if (publish) await publishArticle({ articleId: savedArticleId as any });
        setPublicSlug(savedSlug);
        setExcerpt(nextExcerpt ?? "");
        setMessage(publish ? "글을 공개했습니다." : "드래프트를 저장했습니다.");
        if (!articleId) router.replace(`/admin/articles/${savedArticleId}/edit`);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "글을 저장할 수 없습니다.");
      }
    });
  }

  return (
    <section className="card stack">
      <ArticleToolbar articleId={articleId} slug={publicSlug} status={article?.status} />
      <label>제목<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="뉴스레터 제목을 입력하세요" /></label>
      <p className="helper">공개 주소는 제목을 바탕으로 AI가 자동 생성합니다. 슬러그는 직접 입력하지 않아도 됩니다.</p>
      <label>요약<textarea value={excerpt} readOnly placeholder="저장하면 OpenAI가 본문에 맞게 두 줄 요약을 자동 생성합니다." rows={3} /></label>
      <p className="helper">요약은 저장/공개 시 본문을 기준으로 자동 생성되어 목록과 이메일 미리보기에 사용됩니다.</p>
      <label className="stack">
        커버 이미지
        <CoverImageUploader
          imageUrl={coverImageUrl}
          onChange={(image) => {
            setCoverImageId(image?.storageId ?? "");
            setCoverImageUrl(image?.url ?? "");
          }}
        />
      </label>
      <TiptapEditor value={editorJson} onChange={setEditorJson} />
      <div className="row">
        <button type="button" disabled={isPending} onClick={() => persist()}>{isPending ? "저장 중..." : "드래프트 저장"}</button>
        <button type="button" disabled={isPending || !articleId} className="secondary" onClick={() => persist({ publish: true })}>공개하기</button>
      </div>
      {message ? <p className="helper">{message}</p> : null}
    </section>
  );
}
