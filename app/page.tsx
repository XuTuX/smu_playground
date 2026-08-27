import { GameRankingBoards } from "@/components/home/GameRankingBoard";
import { DepartmentRanking } from "@/components/ranking/DepartmentRanking";
import { PlayerRanking } from "@/components/ranking/PlayerRanking";
import { PressableLink } from "@/components/ui/PressableLink";
import { RetroCard } from "@/components/ui/RetroCard";
import { SeryongMascot } from "@/components/ui/SeryongMascot";
import { getAllScores } from "@/lib/mock-store";
import { getDepartmentStandings, getPlayerStandings } from "@/lib/ranking";

export default function HomePage() {
  const scores = getAllScores();
  const standings = getDepartmentStandings(scores);
  const playerStandings = getPlayerStandings(scores, { limit: 3 });

  return (
    <div className="home-single-page">
      <div className="site-shell">
        {(standings.length > 0 || playerStandings.length > 0) && (
          <section className="home-top-rankings" aria-label="오늘의 상위 순위">
            <div className="home-top-rankings-intro">
              <div>
                <p>오늘의 랭킹</p>
                <h1>TOP 3</h1>
              </div>
              <SeryongMascot className="home-mascot" sizes="(max-width: 820px) 82px, 128px" eager />
            </div>
            <div className="home-top-ranking-grid">
              {standings.length > 0 && (
                <section id="department-ranking" aria-labelledby="department-ranking-title">
                  <div className="home-ranking-heading">
                    <div>
                      <span>DEPARTMENT</span>
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
                      <span>PLAYER</span>
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
          </section>
        )}
        {standings.length === 0 && playerStandings.length === 0 && (
          <section className="section-block">
            <RetroCard className="home-empty-card">
              <SeryongMascot className="empty-state-mascot" sizes="110px" eager />
              <p>아직 등록된 게임 기록이 없습니다.</p>
              <span>세룡이와 함께 첫 기록을 남겨보세요!</span>
            </RetroCard>
          </section>
        )}
        {scores.length > 0 && (
          <section className="section-block home-all-games-section" id="game-rankings">
            <div className="section-heading">
              <div>
                <span className="home-section-label">GAME RANKING</span>
                <h2>게임별 TOP 5</h2>
              </div>
              <p className="ranking-rule">게임을 선택해 상위 기록을 확인하세요.</p>
            </div>
            <GameRankingBoards scores={scores} />
          </section>
        )}
      </div>
    </div>
  );
}
