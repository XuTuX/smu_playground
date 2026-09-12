import type { Metadata } from "next";
import { RankingAutoRefresh } from "@/components/ranking/RankingAutoRefresh";
import { AllTeamsRankingView } from "@/components/ranking/AllTeamsRankingView";
import { getAllScores } from "@/lib/score-store";
import { getTeamStandings } from "@/lib/ranking";

export const metadata: Metadata = { title: "팀게임 순위 - SMU 놀이터" };
export const dynamic = "force-dynamic";

export default async function TeamsRankingPage() {
  const scores = await getAllScores();
  const standings = getTeamStandings(scores);

  return (
    <div className="site-shell">
      <RankingAutoRefresh />
      <AllTeamsRankingView standings={standings} />
    </div>
  );
}
