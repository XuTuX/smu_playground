import Link from "next/link";
import type { DepartmentStanding } from "@/lib/types";

export function RankingPodium({ standings, linked = true }: { standings: DepartmentStanding[]; linked?: boolean }) {
  const podium = [standings[1], standings[0], standings[2]].filter(Boolean);
  return <div className="ranking-podium">{podium.map((standing) => {
    const content = <><b>{standing.rank}위</b><h2>{standing.departmentName}</h2><strong>{standing.totalScore.toLocaleString("ko-KR")}<small>점</small></strong></>;
    const className = `podium-card podium-${standing.rank}`;
    return linked
      ? <Link href={`/departments/${standing.departmentId}`} className={className} key={standing.departmentId}>{content}</Link>
      : <div className={className} key={standing.departmentId}>{content}</div>;
  })}</div>;
}
