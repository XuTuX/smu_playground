import { GameRankingBoards } from "@/components/home/GameRankingBoard";
import { DepartmentRanking } from "@/components/ranking/DepartmentRanking";
import { PlayerRanking } from "@/components/ranking/PlayerRanking";
import { RetroCard } from "@/components/ui/RetroCard";
import { getAllScores } from "@/lib/mock-store";
import { getDepartmentStandings, getPlayerStandings } from "@/lib/ranking";

export default function HomePage() {
  const scores = getAllScores();
  const standings = getDepartmentStandings(scores);
  const playerStandings = getPlayerStandings(scores, { limit: 10 });

  return (
    <div className="home-single-page">
      <div className="site-shell">
        <header className="home-page-intro">
          <h1>전체 순위</h1>
          <p>종합 순위부터 게임별 학과·개인 순위까지 한 화면에서 확인하세요.</p>
        </header>
        {standings.length > 0 && (
          <section className="section-block home-overall-section">
            <div className="section-heading">
              <h2>종합 학과 순위</h2>
              <p className="ranking-rule">게임별 학과 상위 5개 기록 합산</p>
            </div>
            <RetroCard className="all-departments-card">
              <DepartmentRanking standings={standings} limit={standings.length} linked={false} />
            </RetroCard>
          </section>
        )}
        {playerStandings.length > 0 && (
          <section className="section-block home-player-ranking-section">
            <div className="section-heading">
              <h2>종합 개인 순위</h2>
              <p className="ranking-rule">전체 게임 상위 10개 기록</p>
            </div>
            <RetroCard className="home-player-ranking-card">
              <PlayerRanking standings={playerStandings} linked={false} />
            </RetroCard>
          </section>
        )}
        {standings.length === 0 && playerStandings.length === 0 && (
          <section className="section-block">
            <RetroCard style={{ padding: "64px 20px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "17px", color: "var(--muted)" }}>
                아직 등록된 게임 기록이 없습니다.
              </p>
            </RetroCard>
          </section>
        )}
        {scores.length > 0 && (
          <section className="section-block home-all-games-section">
            <div className="section-heading">
              <h2>게임별 순위</h2>
              <p className="ranking-rule">게임마다 학과 순위와 개인 순위를 함께 표시합니다.</p>
            </div>
            <GameRankingBoards scores={scores} />
          </section>
        )}
      </div>
    </div>
  );
}
