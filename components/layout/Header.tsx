import Link from "next/link";

const links = [["홈", "/"], ["게임별 순위", "/games"], ["개인 순위", "/ranking"]] as const;

export function Header() {
  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link href="/" className="brand-lockup" aria-label="SMU 놀이터 홈">
          <span className="brand-pixel" aria-hidden="true"><i /><i /><i /><i /></span>
          <span><strong>SMU</strong><b>놀이터</b></span>
        </Link>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
      </div>
    </header>
  );
}
