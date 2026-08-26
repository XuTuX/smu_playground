"use client";

import { useMemo, useState } from "react";
import { PlayerRanking } from "@/components/ranking/PlayerRanking";
import { departments } from "@/data/departments";
import { games } from "@/data/games";
import { getPlayerStandings } from "@/lib/ranking";
import type { ScoreRecord } from "@/lib/types";

export function RankingExplorer({ scores }: { scores: ScoreRecord[] }) {
  const [gameId, setGameId] = useState(""); const [departmentId, setDepartmentId] = useState("");
  const standings = useMemo(() => getPlayerStandings(scores, { gameId: gameId || undefined, departmentId: departmentId || undefined, limit: 50 }), [scores, gameId, departmentId]);
  return <><div className="ranking-filters"><label>게임<select value={gameId} onChange={(event) => setGameId(event.target.value)}><option value="">전체 게임</option>{games.map((game) => <option value={game.id} key={game.id}>{game.name}</option>)}</select></label><label>학과<select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}><option value="">전체 학과</option>{departments.map((department) => <option value={department.id} key={department.id}>{department.name}</option>)}</select></label>{standings.length > 0 && <span className="filter-result-count">기록 {standings.length}개</span>}</div><PlayerRanking standings={standings} /></>;
}
