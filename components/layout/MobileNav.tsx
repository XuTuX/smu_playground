import Link from "next/link";

const items = [["홈", "/"], ["게임별 순위", "/games"], ["개인 순위", "/ranking"]] as const;

export function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="모바일 주요 메뉴">
      {items.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
    </nav>
  );
}
