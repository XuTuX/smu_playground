"use client";

import { useMemo, useState } from "react";
import { PlayerRanking } from "@/components/ranking/PlayerRanking";
import { EmptyState } from "@/components/ui/EmptyState";
import { departments } from "@/data/departments";
import { games } from "@/data/games";
import { getOverallPlayerStandings, getPlayerStandings } from "@/lib/ranking";
import type { ScoreRecord } from "@/lib/types";

export function RankingExplorer({ scores }: { scores: ScoreRecord[] }) {
  const [gameId, setGameId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [searchNickname, setSearchNickname] = useState("");

  const isOverall = gameId === "";
  const rankingMode = games.find((game) => game.id === gameId)?.rankingMode ?? "individual";

  const rawStandings = useMemo(
    () =>
      isOverall
        ? getOverallPlayerStandings(scores, {
            departmentId: departmentId || undefined,
            limit: 50,
          })
        : getPlayerStandings(scores, {
            gameId,
            departmentId: departmentId || undefined,
            limit: 50,
          }),
    [scores, gameId, departmentId, isOverall],
  );

  const standings = useMemo(() => {
    if (!searchNickname.trim()) return rawStandings;
    const query = searchNickname.trim().toLowerCase();
    return rawStandings.filter((item) => item.nickname.toLowerCase().includes(query));
  }, [rawStandings, searchNickname]);

  const hasFilter = gameId !== "" || departmentId !== "" || searchNickname.trim() !== "";

  return (
    <div className="ranking-explorer">
      <div className="ranking-filters">
        <label>
          게임
          <select value={gameId} onChange={(event) => setGameId(event.target.value)}>
            <option value="">전체 순위</option>
            {games.map((game) => (
              <option value={game.id} key={game.id}>
                {game.name} ({game.rankingMode === "team" ? "팀전" : "개인전"})
              </option>
            ))}
          </select>
        </label>

        <label>
          학과
          <select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
            <option value="">전체 학과</option>
            {departments.map((department) => (
              <option value={department.id} key={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          닉네임 검색
          <div className="search-input-wrap">
            <input
              type="search"
              value={searchNickname}
              onChange={(e) => setSearchNickname(e.target.value)}
              placeholder="닉네임 / 팀명"
              className="search-input"
              aria-label="닉네임 검색"
            />
            {searchNickname && (
              <button
                type="button"
                className="search-clear-button"
                onClick={() => setSearchNickname("")}
                aria-label="검색어 지우기"
              >
                ✕
              </button>
            )}
          </div>
        </label>
      </div>

      <div className="ranking-filter-status">
        <span className="filter-result-count">
          {isOverall
            ? `참가자 ${standings.length}명`
            : rankingMode === "team"
              ? `팀 ${standings.length}개`
              : `기록 ${standings.length}개`}
        </span>
        {hasFilter && (
          <button
            type="button"
            className="filter-reset-link"
            onClick={() => {
              setGameId("");
              setDepartmentId("");
              setSearchNickname("");
            }}
          >
            필터 초기화
          </button>
        )}
      </div>

      {standings.length > 0 ? (
        <PlayerRanking standings={standings} linked={!isOverall} mode={rankingMode} />
      ) : (
        <EmptyState
          compact
          title="해당 조건의 기록이 없어요"
          description="게임 또는 학과 필터를 바꾸거나 검색어를 확인해보세요."
        />
      )}
    </div>
  );
}
