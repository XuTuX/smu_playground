"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SeryongMascot } from "@/components/ui/SeryongMascot";

export function Header() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isDepartments = pathname.startsWith("/departments");
  const isRanking = pathname.startsWith("/ranking");

  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link href="/" className="brand-lockup" aria-label="SMU 놀이터 홈">
          <span className="brand-icon" aria-hidden="true">
            <SeryongMascot className="brand-mascot" sizes="36px" eager />
          </span>
          <span className="brand-text">
            <strong>SMU</strong>
            <span>놀이터</span>
          </span>
        </Link>

        <nav className="header-nav" aria-label="주요 메뉴">
          <Link
            href="/"
            className={`header-nav-link${isHome ? " is-active" : ""}`}
            aria-current={isHome ? "page" : undefined}
          >
            홈
          </Link>
          <Link
            href="/departments"
            className={`header-nav-link${isDepartments ? " is-active" : ""}`}
            aria-current={isDepartments ? "page" : undefined}
          >
            학과 순위
          </Link>
          <Link
            href="/ranking"
            className={`header-nav-link${isRanking ? " is-active" : ""}`}
            aria-current={isRanking ? "page" : undefined}
          >
            개인·팀 순위
          </Link>
        </nav>

        <div className="header-right">
          <span className="header-live-badge" title="5초마다 순위가 자동 갱신됩니다">
            <span className="live-dot" aria-hidden="true" />
            <span>실시간 반영</span>
          </span>
        </div>
      </div>
    </header>
  );
}
