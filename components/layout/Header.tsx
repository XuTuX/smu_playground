import Link from "next/link";
import { SeryongMascot } from "@/components/ui/SeryongMascot";
import { MockDataToggle } from "@/components/ui/MockDataToggle";
import { isMockModeActive, isMockModeAvailable } from "@/lib/score-store";

export async function Header() {
  const mockAvailable = isMockModeAvailable();
  const mockActive = mockAvailable ? await isMockModeActive() : false;

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
          <Link href="/" className="header-nav-link">대시보드</Link>
          <Link href="/departments" className="header-nav-link">학과 순위</Link>
          <Link href="/ranking" className="header-nav-link">참가자 순위</Link>
        </nav>

        <div className="header-right">
          {mockAvailable && <MockDataToggle initialIsMock={mockActive} />}
        </div>
      </div>
    </header>
  );
}
