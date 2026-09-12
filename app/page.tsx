import { MainDashboard } from "@/components/home/MainDashboard";
import { RankingAutoRefresh } from "@/components/ranking/RankingAutoRefresh";
import { EmptyState } from "@/components/ui/EmptyState";
import { RetroCard } from "@/components/ui/RetroCard";
import { getAllScores } from "@/lib/score-store";
import { getDepartmentStandings, getOverallPlayerStandings } from "@/lib/ranking";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const scores = await getAllScores();
  const standings = getDepartmentStandings(scores);
  const playerStandings = getOverallPlayerStandings(scores);
  const hasRankings = standings.length > 0 || playerStandings.length > 0;

  return (
    <div className="home-single-page">
      <RankingAutoRefresh />
      <div className="site-shell">
        <section className="home-top-rankings">
          <header className="home-ranking-intro">
            <h1>청룡체전 실시간 순위</h1>
          </header>

          {hasRankings ? (
            <MainDashboard
              standings={standings}
              playerStandings={playerStandings}
              scores={scores}
            />
          ) : (
            <RetroCard className="home-empty-card-wrapper">
              <EmptyState
                title="아직 등록된 랭킹 기록이 없어요!"
                description="미니게임에 참여하면 학과와 개인 순위가 이곳에 표시됩니다."
              />
            </RetroCard>
          )}
        </section>
      </div>
    </div>
  );
}
