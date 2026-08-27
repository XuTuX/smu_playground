import { SeryongMascot } from "@/components/ui/SeryongMascot";

export function Footer() {
  return (
    <footer className="site-footer"><div className="site-shell footer-inner">
      <div className="footer-brand">
        <SeryongMascot className="footer-mascot" sizes="64px" eager />
        <p><strong>SMU 놀이터</strong> · 세명대학교 청룡체전 미니게임 부스</p>
      </div>
    </div></footer>
  );
}
