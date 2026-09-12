import { DepartmentRanking } from "@/components/ranking/DepartmentRanking";
import { PlayerRanking } from "@/components/ranking/PlayerRanking";
import { GameRankingTabs } from "@/components/home/GameRankingTabs";
import { PressableLink } from "@/components/ui/PressableLink";
import { games } from "@/data/games";
import { getDepartmentStandings, getPlayerStandings } from "@/lib/ranking";
import type { ScoreRecord } from "@/lib/types";

export function GameRankingBoards({ scores }: { scores: ScoreRecord[] }) {
  return (
    <GameRankingTabs
      tabs={games.map(({ id, name, emoji, accent }) => ({ id, name, emoji, accent }))}
    >
      {games.map((game) => {
        const gameScores = scores.filter((score) => score.gameId === game.id);
        const departmentStandings = getDepartmentStandings(gameScores).slice(0, 5);
        const playerStandings = getPlayerStandings(gameScores, { limit: 5 });
        const topRecord = playerStandings[0];

        return (
          <article className="home-game-board" id={`game-${game.slug}`} key={game.id}>
            <header className={`home-game-board-header accent-${game.accent}`}>
              <span className="home-game-board-emoji" aria-hidden="true">{game.emoji}</span>
              <div className="home-game-board-copy">
                <div className="game-board-meta">
                  <span className="game-mode-tag">
                    {game.rankingMode === "team" ? "👥 협동 팀전" : "👤 개인 챌린지"}
                  </span>
                  {topRecord && (
                    <span className="game-top-summary">
                      최고 기록: <strong>{topRecord.score.toLocaleString("ko-KR")}점</strong> ({topRecord.nickname})
                    </span>
                  )}
                </div>
                <h3>{game.name}</h3>
                <p className="game-board-desc">{game.description}</p>
              </div>
              <div className="game-board-action">
                <PressableLink href={`/games/${game.slug}`} className="pressable-cream">
                  전체 기록 보기
                </PressableLink>
              </div>
            </header>
            <div className="home-game-ranking-columns">
              <section aria-label={`${game.name} 학과 순위`}>
                <div className="ranking-column-header">
                  <h4>학과 TOP 5</h4>
                  <span className="ranking-column-badge">합산 순위</span>
                </div>
                <DepartmentRanking standings={departmentStandings} limit={5} linked={false} />
              </section>
              <section aria-label={`${game.name} ${game.rankingMode === "team" ? "팀" : "개인"} 순위`}>
                <div className="ranking-column-header">
                  <h4>{game.rankingMode === "team" ? "팀" : "개인"} TOP 5</h4>
                  <span className="ranking-column-badge">최고 점수</span>
                </div>
                <PlayerRanking standings={playerStandings} linked={false} mode={game.rankingMode} />
              </section>
            </div>
          </article>
        );
      })}
    </GameRankingTabs>
  );
}
