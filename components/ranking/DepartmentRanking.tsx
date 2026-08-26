import Link from "next/link";
import type { DepartmentStanding } from "@/lib/types";

export function DepartmentRanking({ standings, limit = 5 }: { standings: DepartmentStanding[]; limit?: number }) {
  return <div className="department-ranking-list">{standings.slice(0, limit).map((standing) => <Link href={`/departments/${standing.departmentId}`} className={`department-ranking-row rank-row-${standing.rank}`} key={standing.departmentId}><span className={`rank-number rank-${standing.rank}`}>{String(standing.rank).padStart(2, "0")}</span><strong>{standing.departmentName}</strong><b>{standing.totalScore.toLocaleString("ko-KR")}<small>점</small></b></Link>)}</div>;
}
