import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="stack">
      <section className="card stack">
        <p className="status-pill">관리자</p>
        <h1>뉴스레터 관리실</h1>
        <p className="helper">글을 작성하고, 공개 URL을 확인하고, 구독자를 관리한 뒤 공개 글을 메일로 발송하세요.</p>
        <div className="row">
          <Link className="button" href="/admin/articles/new">새 글 작성</Link>
          <Link className="button secondary" href="/admin/articles">글 목록</Link>
          <Link className="button secondary" href="/admin/subscribers">구독자</Link>
        </div>
      </section>
    </main>
  );
}
