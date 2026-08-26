import Link from "next/link";
import type { DepartmentStanding } from "@/lib/types";

export function RankingPodium({ standings }: { standings: DepartmentStanding[] }) {
  const podium = [standings[1], standings[0], standings[2]].filter(Boolean);
  return <div className="ranking-podium">{podium.map((standing) => <Link href={`/departments/${standing.departmentId}`} className={`podium-card podium-${standing.rank}`} key={standing.departmentId}><b>{standing.rank}위</b><h2>{standing.departmentName}</h2><strong>{standing.totalScore.toLocaleString("ko-KR")}<small>점</small></strong></Link>)}</div>;
}
