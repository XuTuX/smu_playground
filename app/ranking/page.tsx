import type { Metadata } from "next";
import { RankingExplorer } from "@/components/ranking/RankingExplorer";
import { RankingAutoRefresh } from "@/components/ranking/RankingAutoRefresh";
import { RetroCard } from "@/components/ui/RetroCard";
import { getAllScores } from "@/lib/score-store";

export const metadata: Metadata = { title: "개인 순위" };
export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const scores = await getAllScores();
  return (
    <div className="site-shell ranking-list-page">
      <RankingAutoRefresh />
      <header className="page-intro public-page-intro ranking-page-intro">
        <h1>개인 순위</h1>
        <p>게임과 학과를 선택해 전체 개인 기록을 확인할 수 있습니다.</p>
      </header>
      <section className="section-block ranking-list-section" aria-label="전체 개인 순위">
        <RetroCard className="ranking-explorer-card">
          <RankingExplorer scores={scores} />
        </RetroCard>
      </section>
    </div>
  );
}
