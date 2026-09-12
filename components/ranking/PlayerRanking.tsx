import Link from "next/link";
import type { PlayerStanding } from "@/lib/types";

type PlayerRankingProps = {
  standings: PlayerStanding[];
  linked?: boolean;
  mode?: "individual" | "team";
};

export function PlayerRanking({ standings, linked = true, mode = "individual" }: PlayerRankingProps) {
  if (standings.length === 0) {
    return <div className="ranking-empty-message">등록된 {mode === "team" ? "팀" : "개인"} 기록이 없습니다.</div>;
  }

  return (
    <div className="player-ranking-list" role="list">
      {standings.map((standing) => {
        const medal =
          standing.rank === 1 ? "🥇" : standing.rank === 2 ? "🥈" : standing.rank === 3 ? "🥉" : null;

        const content = (
          <>
            <span
              className={`rank-number player-rank-${standing.rank}`}
              title={`${standing.rank}위`}
              aria-label={`${standing.rank}위`}
            >
              {medal ? (
                <span className="rank-medal-emoji" aria-hidden="true">
                  {medal}
                </span>
              ) : (
                String(standing.rank).padStart(2, "0")
              )}
            </span>
            <div className="player-info-wrap">
              <strong>{standing.nickname}</strong>
              <small>{standing.departmentName}</small>
            </div>
            <em>{standing.gameName}</em>
            <b className="player-score-value">
              {standing.score.toLocaleString("ko-KR")}
              <small>점</small>
            </b>
          </>
        );
        const className = `player-ranking-row player-rank-${standing.rank}${linked ? "" : " ranking-row-static"}`;

        return linked ? (
          <Link
            href={`/ranking/${standing.id}`}
            className={className}
            role="listitem"
            key={standing.id}
          >
            {content}
          </Link>
        ) : (
          <div className={className} role="listitem" key={standing.id}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
