import React from "react";
import type { TeamStanding } from "@/lib/types";

export function AllTeamsRankingView({
  standings,
}: {
  standings: TeamStanding[];
}) {
  const champion = standings[0];

  return (
    <div className="py-6 sm:py-10">

      {/* Hero Header */}
      <header className="p-6 sm:p-8 rounded-3xl bg-[#EAF8F1] shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              전체 팀게임 순위
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
            {champion && (
              <div className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-white shadow-sm text-center">
                <span className="text-sm font-bold text-stone-500 block">현재 1위 팀</span>
                <strong className="text-lg sm:text-xl font-black text-amber-600 block mt-0.5 break-keep-all">
                  {champion.teamName}
                </strong>
                <span className="text-sm font-bold text-stone-500 block mt-0.5 truncate">
                  {champion.departmentName} ({champion.score.toLocaleString("ko-KR")}점)
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Ranking List */}
      <div className="space-y-3">
        {standings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl shadow-sm text-stone-500 font-semibold text-base">
            등록된 팀 기록이 없습니다.
          </div>
        ) : (
          standings.map((team) => {
            const rankBadgeClass =
              team.rank === 1
                ? "bg-amber-100 text-amber-900 font-black"
                : team.rank === 2
                  ? "bg-slate-100 text-slate-800 font-black"
                  : team.rank === 3
                    ? "bg-orange-100 text-orange-900 font-black"
                    : "bg-stone-100 text-stone-600 font-bold";

            const medalEmoji =
              team.rank === 1 ? "🥇" : team.rank === 2 ? "🥈" : team.rank === 3 ? "🥉" : null;

            return (
              <div
                key={team.id}
                className="p-4 sm:p-5 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 flex-wrap"
              >
                {/* Left: Rank badge + Team name + Department + Inline Game Scores */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base shrink-0 ${rankBadgeClass}`}
                  >
                    {medalEmoji || `${team.rank}위`}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                      <strong className="text-lg sm:text-xl font-black text-stone-900">
                        {team.teamName}
                      </strong>
                      <span className="text-sm font-semibold text-stone-500">
                        {team.departmentName}
                      </span>
                      {/* Inline game scores: 이모티콘 : 점수 */}
                      {team.gameScores.map((game) => (
                        <span
                          key={game.gameId}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-stone-100/90 text-sm font-bold text-stone-700"
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
                  </div>
                </div>

                {/* Right: Total Score */}
                <div className="flex items-center gap-2 shrink-0 ml-auto">
                  <span className="text-sm font-bold text-stone-500">종합 점수</span>
                  <b className="text-xl sm:text-2xl font-black text-stone-900">
                    {team.score.toLocaleString("ko-KR")}
                    <span className="text-sm font-bold ml-0.5">점</span>
                  </b>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
