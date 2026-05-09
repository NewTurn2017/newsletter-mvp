import Link from "next/link";

export default function Home() {
  return (
    <main className="stack">
      <section className="card stack">
        <p className="status-pill">싱글 브랜드 뉴스레터 MVP</p>
        <h1>글을 작성하고, 공개하고, 구독자에게 메일로 발송하세요.</h1>
        <p className="helper">관리자 로그인, 긴 글 편집기, Convex Storage 이미지 업로드, 공개 URL, 구독자 목록, Resend 발송까지 하나의 흐름으로 구성했습니다.</p>
        <div className="row">
          <Link className="button" href="/admin/articles/new">글 작성하기</Link>
          <Link className="button secondary" href="/admin/subscribers">구독자 관리</Link>
        </div>
      </section>
      <section className="grid">
        <div className="card"><h2>쓰기 중심 편집</h2><p className="helper">굵게, 이탤릭, 제목 크기, 목록, 인용, 요약 박스, 이미지 업로드를 지원합니다.</p></div>
        <div className="card"><h2>공개 후 발송</h2><p className="helper">공개된 글만 구독자에게 메일로 발송할 수 있습니다.</p></div>
        <div className="card"><h2>Convex 기반 기록</h2><p className="helper">이미지는 Storage ID로 저장하고, 발송 기록은 성공/실패 상태로 남깁니다.</p></div>
      </section>
    </main>
  );
}
