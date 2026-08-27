import type { Metadata } from "next";
import { RankingExplorer } from "@/components/ranking/RankingExplorer";
import { RetroCard } from "@/components/ui/RetroCard";
import { getAllScores } from "@/lib/mock-store";

export const metadata: Metadata = { title: "개인 순위" };

export default function RankingPage() {
  return (
    <div className="site-shell ranking-list-page">
      <header className="page-intro public-page-intro ranking-page-intro">
        <h1>개인 순위</h1>
        <p>게임과 학과를 선택해 전체 개인 기록을 확인할 수 있습니다.</p>
      </header>
      <section className="section-block ranking-list-section" aria-label="전체 개인 순위">
        <RetroCard className="ranking-explorer-card">
          <RankingExplorer scores={getAllScores()} />
        </RetroCard>
      </section>
    </div>
  );
}
