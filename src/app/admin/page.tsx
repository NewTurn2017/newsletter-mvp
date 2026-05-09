import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="stack">
      <section className="card stack">
        <p className="status-pill">Admin</p>
        <h1>Newsletter control room</h1>
        <p className="helper">Create articles, preview and publish public URLs, manage active subscribers, then send published articles.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="button" href="/admin/articles/new">New article</Link>
          <Link className="button secondary" href="/admin/articles">Article list</Link>
          <Link className="button secondary" href="/admin/subscribers">Subscribers</Link>
        </div>
      </section>
    </main>
  );
}
