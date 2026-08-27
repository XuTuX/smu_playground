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
  return (
    <div className="department-ranking-list" role="list">
      {standings.slice(0, limit).map((standing) => {
        const content = (
          <>
            <span className={`rank-number rank-${standing.rank}`}>
              {String(standing.rank).padStart(2, "0")}
            </span>
            <strong>{standing.departmentName}</strong>
            <b>
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
