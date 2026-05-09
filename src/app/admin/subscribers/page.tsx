import { SubscriberForm } from "@/components/subscribers/SubscriberForm";
import { SubscriberList } from "@/components/subscribers/SubscriberList";

export default function SubscribersPage() {
  return (
    <main className="stack">
      <section className="card">
        <p className="status-pill">구독자</p>
        <h1>기본 구독자 목록</h1>
        <p className="helper">활성 구독자는 Convex 발송 대상에 포함되고, 구독 해지 상태는 발송에서 제외됩니다.</p>
      </section>
      <SubscriberForm />
      <SubscriberList />
    </main>
  );
}
