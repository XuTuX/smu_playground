import Link from "next/link";
import type { PlayerStanding } from "@/lib/types";

type PlayerRankingProps = {
  standings: PlayerStanding[];
  linked?: boolean;
};

export function PlayerRanking({ standings, linked = true }: PlayerRankingProps) {
  if (standings.length === 0) {
    return <div className="ranking-empty-message">등록된 기록이 없습니다.</div>;
  }

  return (
    <div className="player-ranking-list" role="list">
      {standings.map((standing) => {
        const content = (
          <>
            <span>{String(standing.rank).padStart(2, "0")}</span>
            <div>
              <strong>{standing.nickname}</strong>
              <small>{standing.departmentName}</small>
            </div>
            <em>{standing.gameName}</em>
            <b>
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
