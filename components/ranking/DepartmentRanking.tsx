import Link from "next/link";
import type { DepartmentStanding } from "@/lib/types";

type DepartmentRankingProps = {
  standings: DepartmentStanding[];
  limit?: number;
  linked?: boolean;
};

export function DepartmentRanking({
  standings,
  limit = 5,
  linked = true,
}: DepartmentRankingProps) {
  if (standings.length === 0) {
    return <div className="ranking-empty-message">아직 기록이 없어요.</div>;
  }

  return (
    <div className="department-ranking-list" role="list">
      {standings.slice(0, limit).map((standing) => {
        const medal =
          standing.rank === 1 ? "🥇" : standing.rank === 2 ? "🥈" : standing.rank === 3 ? "🥉" : null;

        const content = (
          <>
            <span
              className={`rank-number rank-${standing.rank}`}
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
            <strong className="department-row-name">{standing.departmentName}</strong>
            <b className="department-row-score">
              {standing.totalScore.toLocaleString("ko-KR")}
              <small>점</small>
            </b>
          </>
        );
        const className = `department-ranking-row rank-row-${standing.rank}${linked ? "" : " ranking-row-static"}`;

        return linked ? (
          <Link
            href={`/departments/${standing.departmentId}`}
            className={className}
            role="listitem"
            key={standing.departmentId}
          >
            {content}
          </Link>
        ) : (
          <div className={className} role="listitem" key={standing.departmentId}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
