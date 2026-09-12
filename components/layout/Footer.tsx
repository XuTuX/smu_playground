import Link from "next/link";
import { SeryongMascot } from "@/components/ui/SeryongMascot";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-inner">
        <div className="footer-brand">
          <SeryongMascot className="footer-mascot" sizes="56px" eager />
          <div>
            <strong>SMU 놀이터</strong>
            <p>세명대학교 청룡체전 미니게임 실시간 순위판</p>
          </div>
        </div>
        <nav className="footer-links" aria-label="바로가기 링크">
          <Link href="/">학과 순위</Link>
          <Link href="/?tab=player">개인 순위</Link>
          <Link href="/?tab=game">게임별 순위</Link>
        </nav>
      </div>
    </footer>
  );
}
