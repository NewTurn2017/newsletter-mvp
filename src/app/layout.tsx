import type { Metadata } from "next";
import Link from "next/link";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "YOYO AI 뉴스레터",
  description: "AI와 자동화 인사이트를 이메일로 받아보는 뉴스레터입니다.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <header className="site-header">
            <Link href="/" className="brand">YOYO AI 뉴스레터</Link>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
