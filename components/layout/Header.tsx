import Link from "next/link";

import { SeryongMascot } from "@/components/ui/SeryongMascot";

export function Header() {
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
        <strong className="header-context">청룡체전</strong>
      </div>
    </header>
  );
}
