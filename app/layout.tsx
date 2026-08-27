import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SMU 놀이터", template: "%s · SMU 놀이터" },
  description: "세명대학교 학과 대항 미니게임 아케이드",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>
        <a href="#main-content" className="skip-link">본문 바로가기</a>
        <Header />
        <main className="page-root" id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
