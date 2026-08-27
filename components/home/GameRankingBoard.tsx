import { DepartmentRanking } from "@/components/ranking/DepartmentRanking";
import { PlayerRanking } from "@/components/ranking/PlayerRanking";
import { GameRankingTabs } from "@/components/home/GameRankingTabs";
import { games } from "@/data/games";
import { getDepartmentStandings, getPlayerStandings } from "@/lib/ranking";
import type { ScoreRecord } from "@/lib/types";

export function GameRankingBoards({ scores }: { scores: ScoreRecord[] }) {
  return (
    <GameRankingTabs
      tabs={games.map(({ id, name, accent }) => ({ id, name, accent }))}
    >
      {games.map((game, index) => {
        const gameScores = scores.filter((score) => score.gameId === game.id);
        const departmentStandings = getDepartmentStandings(gameScores).slice(0, 5);
        const playerStandings = getPlayerStandings(gameScores, { limit: 5 });

        return (
          <article className="home-game-board" id={`game-${game.slug}`} key={game.id}>
            <header className={`home-game-board-header accent-${game.accent}`}>
              <span>게임 {index + 1}</span>
              <h3>{game.name}</h3>
              <p>{game.description}</p>
            </header>
            <div className="home-game-ranking-columns">
              <section aria-label={`${game.name} 학과 순위`}>
                <h4>학과 순위</h4>
                <p>학과별 상위 5개 기록 합산</p>
                <DepartmentRanking standings={departmentStandings} limit={5} linked={false} />
              </section>
              <section aria-label={`${game.name} 개인 순위`}>
                <h4>개인 순위</h4>
                <p>상위 5개 기록</p>
                <PlayerRanking standings={playerStandings} linked={false} />
              </section>
            </div>
          </article>
        );
      })}
    </GameRankingTabs>
  );
}
