import Link from "next/link";
import type { PlayerStanding } from "@/lib/types";

export function PlayerRanking({ standings }: { standings: PlayerStanding[] }) {
  if (standings.length === 0) return null;
  return <div className="player-ranking-list">{standings.map((standing) => <Link href={`/ranking/${standing.id}`} className={`player-ranking-row player-rank-${standing.rank}`} key={standing.id}><span>{String(standing.rank).padStart(2, "0")}</span><div><strong>{standing.nickname}</strong><small>{standing.departmentName}</small></div><em>{standing.gameCode.replace("GAME ", "게임 ")}</em><b>{standing.score}<small>점</small></b></Link>)}</div>;
}
