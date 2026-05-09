import Link from "next/link";

export default function Home() {
  return (
    <main className="stack">
      <section className="card stack">
        <p className="status-pill">Single-brand newsletter MVP</p>
        <h1>Write, publish, and send one clear newsletter article.</h1>
        <p className="helper">This MVP keeps the flow intentionally simple: admin sign-in, long-form editor, public article URL, subscriber list, and Convex-owned email sending through Resend.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="button" href="/admin/articles/new">Write an article</Link>
          <Link className="button secondary" href="/admin/subscribers">Manage subscribers</Link>
        </div>
      </section>
      <section className="grid">
        <div className="card"><h2>Beginner-first writing</h2><p className="helper">Tiptap supports headings, links, lists, blockquotes, and URL-based images.</p></div>
        <div className="card"><h2>Publish before send</h2><p className="helper">Only published articles are eligible for email sending.</p></div>
        <div className="card"><h2>Convex-owned sending</h2><p className="helper">EmailSend records are created before provider calls and updated to sent or failed.</p></div>
      </section>
    </main>
  );
}
