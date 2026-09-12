import type { Metadata } from "next";
import { RankingExplorer } from "@/components/ranking/RankingExplorer";
import { RankingAutoRefresh } from "@/components/ranking/RankingAutoRefresh";
import { RetroCard } from "@/components/ui/RetroCard";
import { getAllScores } from "@/lib/score-store";

export const metadata: Metadata = { title: "참가자 순위" };
export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const scores = await getAllScores();
  return (
    <div className="site-shell ranking-list-page">
      <RankingAutoRefresh />
      <header className="page-intro public-page-intro ranking-page-intro">
        <h1>참가자 순위</h1>
        <p>게임과 학과별 기록을 찾아보세요.</p>
      </header>
      <section className="section-block ranking-list-section" aria-label="참가자 순위">
        <RetroCard className="ranking-explorer-card">
          <RankingExplorer scores={scores} />
        </RetroCard>
      </section>
    </div>
  );
}
