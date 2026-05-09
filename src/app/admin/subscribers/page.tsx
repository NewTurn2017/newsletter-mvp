import { SubscriberForm } from "@/components/subscribers/SubscriberForm";
import { SubscriberList } from "@/components/subscribers/SubscriberList";

export default function SubscribersPage() {
  return (
    <main className="stack">
      <section className="card">
        <p className="status-pill">Subscribers</p>
        <h1>Basic subscriber list</h1>
        <p className="helper">Active subscribers are included in Convex-owned send targets. Unsubscribed readers are excluded.</p>
      </section>
      <SubscriberForm />
      <SubscriberList />
    </main>
  );
}
