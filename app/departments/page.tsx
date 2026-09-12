import type { Metadata } from "next";
import { RankingAutoRefresh } from "@/components/ranking/RankingAutoRefresh";
import { AllDepartmentsRankingView } from "@/components/ranking/AllDepartmentsRankingView";
import { getAllScores } from "@/lib/score-store";
import { getDepartmentStandings } from "@/lib/ranking";

export const metadata: Metadata = { title: "학과 순위 - SMU 놀이터" };
export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const scores = await getAllScores();
  const standings = getDepartmentStandings(scores);

  return (
    <div className="site-shell">
      <RankingAutoRefresh />
      <AllDepartmentsRankingView standings={standings} />
    </div>
  );
}
