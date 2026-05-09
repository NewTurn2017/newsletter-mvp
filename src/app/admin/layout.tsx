import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const ADMIN_EMAIL = "genie@codewithgenie.com";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await auth.protect();
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (email !== ADMIN_EMAIL) redirect("/");

  return (
    <main className="container shell stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <span className="badge">관리자</span>
          <h1 style={{ marginBottom: 0 }}>뉴스레터 콘솔</h1>
        </div>
        <UserButton />
      </div>
      {children}
    </main>
  );
}
