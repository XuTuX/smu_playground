import type { Metadata } from "next";
import { RankingAutoRefresh } from "@/components/ranking/RankingAutoRefresh";
import { AllPlayersRankingView } from "@/components/ranking/AllPlayersRankingView";
import { getAllScores } from "@/lib/score-store";
import { getDetailedPlayerStandings } from "@/lib/ranking";

export const metadata: Metadata = { title: "개인 순위" };
export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const scores = await getAllScores();
  const standings = getDetailedPlayerStandings(scores);

  return (
    <div className="site-shell">
      <RankingAutoRefresh />
      <AllPlayersRankingView standings={standings} />
    </div>
  );
}
