import Link from "next/link";
import type { PlayerStanding } from "@/lib/types";

export function PlayerRanking({ standings, linked = true }: { standings: PlayerStanding[]; linked?: boolean }) {
  if (standings.length === 0) {
    return <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--muted)" }}>등록된 기록이 없습니다.</div>;
  }
  return <div className="player-ranking-list">{standings.map((standing) => {
    const content = <><span>{String(standing.rank).padStart(2, "0")}</span><div><strong>{standing.nickname}</strong><small>{standing.departmentName}</small></div><em>{standing.gameName}</em><b>{standing.score}<small>점</small></b></>;
    const className = `player-ranking-row player-rank-${standing.rank}`;
    return linked
      ? <Link href={`/ranking/${standing.id}`} className={className} key={standing.id}>{content}</Link>
      : <div className={className} key={standing.id}>{content}</div>;
  })}</div>;
}
