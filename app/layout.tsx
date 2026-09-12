import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: { default: "SMU 놀이터", template: "%s · SMU 놀이터" },
  description: "세명대학교 청룡체전 5종 미니게임 순위판",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a href="#main-content" className="skip-link">본문 바로가기</a>
        <Header />
        <main className="page-root" id="main-content">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
