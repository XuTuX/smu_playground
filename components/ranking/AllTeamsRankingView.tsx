import React from "react";
import type { TeamStanding } from "@/lib/types";
import { TopThreePodium, type TopThreePodiumItem } from "./TopThreePodium";

export function AllTeamsRankingView({
  standings,
}: {
  standings: TeamStanding[];
}) {
  const topThreeItems: TopThreePodiumItem[] = standings
    .filter((s) => s.rank <= 3)
    .map((s) => ({
      rank: s.rank as 1 | 2 | 3,
      primaryText: s.teamName,
      subText: s.departmentName,
      score: s.score,
    }));

  const remainingStandings = standings.filter((s) => s.rank > 3);

  return (
    <div className="py-6 sm:py-10">
      {/* Hero Header with Top 1, 2, 3 Podium */}
      <header className="p-5 sm:p-8 rounded-3xl bg-[#EAF8F1] shadow-sm mb-8 overflow-hidden">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            전체 팀게임 순위
          </h1>
        </div>

        {/* Top 3 Podium */}
        <TopThreePodium items={topThreeItems} theme="mint" />
      </header>

      {/* 4th Place and Below Ranking List */}
      <div>
        {standings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl shadow-sm text-stone-500 font-semibold text-base">
            등록된 팀 기록이 없습니다.
          </div>
        ) : remainingStandings.length > 0 ? (
          <div className="space-y-3">
              {remainingStandings.map((team) => (
                <div
                  key={team.id}
                  className="p-4 sm:p-5 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 flex-wrap"
                >
                  {/* Left: Rank badge + Team name + Department */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm sm:text-base shrink-0 bg-stone-100 text-stone-600 font-extrabold">
                      {team.rank}위
                    </span>
                    <div className="min-w-0">
                      <strong className="block text-base sm:text-lg font-black text-stone-900 truncate">
                        {team.teamName}
                      </strong>
                      <span className="text-sm font-semibold text-stone-500 truncate block">
                        {team.departmentName}
                      </span>
                    </div>
                  </div>

                  {/* Right: Total Score + Inline Game Scores on the RIGHT */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-end ml-auto">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-stone-500">종합 점수</span>
                      <b className="text-lg sm:text-xl font-black text-stone-900">
                        {team.score.toLocaleString("ko-KR")}
                        <span className="text-sm font-bold ml-0.5">점</span>
                      </b>
                    </div>

                    {/* Game emoji scores on the right */}
                    {team.gameScores.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {team.gameScores.map((game) => (
                          <span
                            key={game.gameId}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100/90 text-sm font-bold text-stone-700"
                            title={`${game.gameName}: ${game.score.toLocaleString("ko-KR")}점`}
                          >
                            <span aria-hidden="true">{game.emoji}</span>
                            <span className="text-stone-400 font-semibold">:</span>
                            <span className="font-black text-stone-900">
                              {game.score.toLocaleString("ko-KR")}점
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
        ) : null}
      </div>
    </div>
  );
}
