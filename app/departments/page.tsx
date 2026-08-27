import type { Metadata } from "next";
import { DepartmentRanking } from "@/components/ranking/DepartmentRanking";
import { RetroCard } from "@/components/ui/RetroCard";
import { getAllScores } from "@/lib/mock-store";
import { getDepartmentStandings } from "@/lib/ranking";

export const metadata: Metadata = { title: "학과 순위" };

export default function DepartmentsPage() {
  const standings = getDepartmentStandings(getAllScores());

  return (
    <div className="site-shell ranking-list-page">
      <header className="page-intro public-page-intro games-page-intro">
        <h1>학과 순위</h1>
        <p>각 게임에서 학과별 상위 5개 기록을 합산한 전체 순위입니다.</p>
      </header>
      <section className="section-block ranking-list-section" aria-label="전체 학과 순위">
        <RetroCard className="all-departments-card">
          <DepartmentRanking standings={standings} limit={standings.length} />
        </RetroCard>
      </section>
    </div>
  );
}
