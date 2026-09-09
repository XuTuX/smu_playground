import { GameRankingBoards } from "@/components/home/GameRankingBoard";
import { DepartmentRanking } from "@/components/ranking/DepartmentRanking";
import { PlayerRanking } from "@/components/ranking/PlayerRanking";
import { RankingAutoRefresh } from "@/components/ranking/RankingAutoRefresh";
import { PressableLink } from "@/components/ui/PressableLink";
import { RetroCard } from "@/components/ui/RetroCard";
import { getAllScores } from "@/lib/score-store";
import { getDepartmentStandings, getOverallPlayerStandings } from "@/lib/ranking";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const scores = await getAllScores();
  const standings = getDepartmentStandings(scores);
  const playerStandings = getOverallPlayerStandings(scores, { limit: 3 });

  return (
    <div className="home-single-page">
      <RankingAutoRefresh />
      <div className="site-shell">
        <section className="home-top-rankings" aria-label="오늘의 상위 순위">
          <header className="home-ranking-intro">
            <h1>최고의 학과를 가려라!</h1>
          </header>
          {(standings.length > 0 || playerStandings.length > 0) && (
            <div className="home-top-ranking-grid">
              {standings.length > 0 && (
                <section id="department-ranking" aria-labelledby="department-ranking-title">
                  <div className="home-ranking-heading">
                    <div>
                      <h2 id="department-ranking-title">학과 TOP 3</h2>
                    </div>
                    <PressableLink href="/departments" className="pressable-cream">자세히 보기</PressableLink>
                  </div>
                  <RetroCard className="home-top-ranking-card home-department-ranking-card">
                    <DepartmentRanking standings={standings} limit={3} linked={false} />
                  </RetroCard>
                </section>
              )}
              {playerStandings.length > 0 && (
                <section id="individual-ranking" aria-labelledby="individual-ranking-title">
                  <div className="home-ranking-heading">
                    <div>
                      <h2 id="individual-ranking-title">개인 TOP 3</h2>
                    </div>
                    <PressableLink href="/ranking" className="pressable-cream">자세히 보기</PressableLink>
                  </div>
                  <RetroCard className="home-top-ranking-card home-player-ranking-card">
                    <PlayerRanking standings={playerStandings} linked={false} />
                  </RetroCard>
                </section>
              )}
            </div>
          )}
        </section>
        <section className="section-block home-all-games-section" id="game-rankings">
          <div className="section-heading">
            <div>
              <h2>5개 게임 순위</h2>
            </div>
          </div>
          <GameRankingBoards scores={scores} />
        </section>
      </div>
    </div>
  );
}
