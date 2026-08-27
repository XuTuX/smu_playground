import { GameRankingBoards } from "@/components/home/GameRankingBoard";
import { DepartmentRanking } from "@/components/ranking/DepartmentRanking";
import { PlayerRanking } from "@/components/ranking/PlayerRanking";
import { RankingPodium } from "@/components/ranking/RankingPodium";
import { RetroCard } from "@/components/ui/RetroCard";
import { SeryongMascot } from "@/components/ui/SeryongMascot";
import { getAllScores } from "@/lib/mock-store";
import { getDepartmentStandings, getPlayerStandings } from "@/lib/ranking";

export default function HomePage() {
  const scores = getAllScores();
  const standings = getDepartmentStandings(scores);
  const playerStandings = getPlayerStandings(scores, { limit: 10 });

  return (
    <div className="home-single-page">
      <div className="site-shell">
        {standings.length >= 3 && (
          <section className="home-hall-of-fame" id="hall-of-fame" aria-labelledby="hall-of-fame-title">
            <div className="home-hall-of-fame-heading">
              <div>
                <p>종합 학과 TOP 3</p>
                <h1 id="hall-of-fame-title">명예의 전당</h1>
              </div>
              <SeryongMascot className="home-mascot" sizes="(max-width: 820px) 92px, 164px" />
            </div>
            <RankingPodium standings={standings} linked={false} />
          </section>
        )}
        {standings.length > 0 && (
          <section className="section-block home-overall-section" id="department-ranking">
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
          <section className="section-block home-player-ranking-section" id="individual-ranking">
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
            <RetroCard className="home-empty-card">
              <SeryongMascot className="empty-state-mascot" sizes="110px" />
              <p>아직 등록된 게임 기록이 없습니다.</p>
              <span>세룡이와 함께 첫 기록을 남겨보세요!</span>
            </RetroCard>
          </section>
        )}
        {scores.length > 0 && (
          <section className="section-block home-all-games-section" id="game-rankings">
            <div className="section-heading">
              <h2>게임별 순위</h2>
              <p className="ranking-rule">게임을 선택하면 학과 순위와 개인 순위가 바뀝니다.</p>
            </div>
            <GameRankingBoards scores={scores} />
          </section>
        )}
      </div>
    </div>
  );
}
