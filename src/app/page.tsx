import { SubscriberForm } from "@/components/subscribers/SubscriberForm";

export default function Home() {
  return (
    <main className="stack public-subscribe-page">
      <section className="card stack hero-card">
        <p className="status-pill">YOYO AI 뉴스레터</p>
        <h1>AI와 자동화로 더 빠르게 실행하는 방법을 받아보세요.</h1>
        <p className="helper">새 글이 발행되면 이메일로 가장 먼저 보내드립니다. 관리자 외 사용자는 이 구독 화면만 이용할 수 있습니다.</p>
      </section>
      <SubscriberForm />
    </main>
  );
}
