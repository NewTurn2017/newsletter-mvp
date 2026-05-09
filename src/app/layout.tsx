import type { Metadata } from "next";
import Link from "next/link";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "뉴스레터 MVP",
  description: "한 브랜드의 뉴스레터 작성, 공개, 메일 발송을 위한 MVP입니다.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <header className="site-header">
            <Link href="/" className="brand">뉴스레터 MVP</Link>
            <nav>
              <Link href="/admin">관리자</Link>
              <Link href="/admin/articles">글 관리</Link>
              <Link href="/admin/subscribers">구독자</Link>
            </nav>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
