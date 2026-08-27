import Link from "next/link";
import type { DepartmentStanding } from "@/lib/types";

type RankingPodiumProps = {
  standings: DepartmentStanding[];
  linked?: boolean;
};

export function RankingPodium({ standings, linked = true }: RankingPodiumProps) {
  const podium = standings.slice(0, 3);

  return (
    <div className="ranking-podium" role="list">
      {podium.map((standing) => {
        const content = (
          <>
            <b>{standing.rank}위</b>
            <h3 className="podium-name">{standing.departmentName}</h3>
            <strong>
              {standing.totalScore.toLocaleString("ko-KR")}
              <small>점</small>
            </strong>
          </>
        );
        const className = `podium-card podium-${standing.rank}${linked ? "" : " ranking-row-static"}`;

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
