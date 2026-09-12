import { Suspense } from "react";
import { FestivalHero } from "@/components/home/FestivalHero";
import { HomePodiumSection } from "@/components/home/HomePodiumSection";
import { GameRankingCardSection } from "@/components/home/GameRankingCardSection";
import { RankingAutoRefresh } from "@/components/ranking/RankingAutoRefresh";
import { getAllScores } from "@/lib/score-store";
import {
  getDepartmentStandings,
  getDetailedPlayerStandings,
  getTeamStandings,
} from "@/lib/ranking";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const scores = await getAllScores();
  const departmentStandings = getDepartmentStandings(scores);
  const detailedPlayerStandings = getDetailedPlayerStandings(scores);
  const teamStandings = getTeamStandings(scores);

  return (
    <div className="min-h-screen">
      <RankingAutoRefresh />
      <div className="site-shell">
        {/* Festival Hero Section */}
        <FestivalHero />

        {/* 3 Main Ranking Podiums (Department, Individual, Team) */}
        <Suspense fallback={<div className="h-64 flex items-center justify-center font-bold text-stone-400">순위 집계 중...</div>}>
          <HomePodiumSection
            departmentStandings={departmentStandings}
            detailedPlayerStandings={detailedPlayerStandings}
            teamStandings={teamStandings}
          />
        </Suspense>

        {/* Separate Game-by-Game Ranking Cards Row */}
        <GameRankingCardSection />
      </div>
    </div>
  );
}
