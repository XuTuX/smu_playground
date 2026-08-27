import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link href="/" className="brand-lockup" aria-label="SMU 놀이터 홈">
          <span className="brand-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="4" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="2.2" />
              <path d="M6 12h4m-2-2v4" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="15.5" cy="10.5" r="1.2" fill="var(--ink)" />
              <circle cx="17.5" cy="13.5" r="1.2" fill="var(--ink)" />
            </svg>
          </span>
          <span className="brand-text">
            <strong>SMU</strong>
            <span>놀이터</span>
          </span>
        </Link>
        <p className="header-context"><span>청룡체전</span> 학과 대항 미니게임 순위판</p>
      </div>
    </header>
  );
}
