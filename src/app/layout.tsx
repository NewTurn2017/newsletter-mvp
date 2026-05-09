import type { Metadata } from "next";
import Link from "next/link";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Newsletter MVP",
  description: "A single-brand newsletter writing, publishing, and sending MVP.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="site-header">
            <Link href="/" className="brand">Newsletter MVP</Link>
            <nav>
              <Link href="/admin">Admin</Link>
              <Link href="/admin/articles">Articles</Link>
              <Link href="/admin/subscribers">Subscribers</Link>
            </nav>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
