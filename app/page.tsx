import { GameRankingBoards } from "@/components/home/GameRankingBoard";
import { DepartmentRanking } from "@/components/ranking/DepartmentRanking";
import { PlayerRanking } from "@/components/ranking/PlayerRanking";
import { RankingAutoRefresh } from "@/components/ranking/RankingAutoRefresh";
import { EmptyState } from "@/components/ui/EmptyState";
import { PressableLink } from "@/components/ui/PressableLink";
import { RetroCard } from "@/components/ui/RetroCard";
import { getAllScores } from "@/lib/score-store";
import { getDepartmentStandings, getOverallPlayerStandings } from "@/lib/ranking";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const scores = await getAllScores();
  const standings = getDepartmentStandings(scores);
  const playerStandings = getOverallPlayerStandings(scores, { limit: 3 });

  const hasRankings = standings.length > 0 || playerStandings.length > 0;

  return (
    <div className="home-single-page">
      <RankingAutoRefresh />
      <div className="site-shell">
        <section className="home-top-rankings" aria-label="오늘의 상위 순위">
          <header className="home-ranking-intro">
            <p className="home-ranking-subtitle">세명대학교 청룡체전 5종 미니게임 대항전</p>
            <h1>최고의 학과를 가려라!</h1>
          </header>

          {hasRankings ? (
            <div className="home-top-ranking-grid">
              {standings.length > 0 && (
                <section id="department-ranking" aria-labelledby="department-ranking-title">
                  <div className="home-ranking-heading">
                    <div>
                      <h2 id="department-ranking-title">학과 TOP 3</h2>
                    </div>
                    <PressableLink href="/departments" className="pressable-cream">
                      전체 학과 순위
                    </PressableLink>
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
                    <PressableLink href="/ranking" className="pressable-cream">
                      전체 개인 순위
                    </PressableLink>
                  </div>
                  <RetroCard className="home-top-ranking-card home-player-ranking-card">
                    <PlayerRanking standings={playerStandings} linked={false} />
                  </RetroCard>
                </section>
              )}
            </div>
          ) : (
            <RetroCard className="home-empty-card-wrapper">
              <EmptyState
                title="아직 등록된 랭킹 기록이 없어요!"
                description="부스에서 미니게임에 참여하고 우리 학과를 순위표 1위에 올려보세요!"
              />
            </RetroCard>
          )}
        </section>

        <section className="section-block home-all-games-section" id="game-rankings">
          <div className="section-heading">
            <div>
              <h2>5개 게임별 실시간 순위</h2>
            </div>
          </div>
          <GameRankingBoards scores={scores} />
        </section>
      </div>
    </div>
  );
}
