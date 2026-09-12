import type { Metadata } from "next";
import { DepartmentExplorer } from "@/components/ranking/DepartmentExplorer";
import { RankingAutoRefresh } from "@/components/ranking/RankingAutoRefresh";
import { RetroCard } from "@/components/ui/RetroCard";
import { getAllScores } from "@/lib/score-store";
import { getDepartmentStandings } from "@/lib/ranking";

export const metadata: Metadata = { title: "학과 순위" };
export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const standings = getDepartmentStandings(await getAllScores());

  return (
    <div className="site-shell ranking-list-page">
      <RankingAutoRefresh />
      <header className="page-intro public-page-intro games-page-intro">
        <h1>전체 학과 순위</h1>
        <p>각 게임에서 학과별 상위 5개 기록을 합산한 종합 순위입니다.</p>
      </header>
      <section className="section-block ranking-list-section" aria-label="전체 학과 순위">
        <RetroCard className="all-departments-card">
          <DepartmentExplorer standings={standings} />
        </RetroCard>
      </section>
    </div>
  );
}
