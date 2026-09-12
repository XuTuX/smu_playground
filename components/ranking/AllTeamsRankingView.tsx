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
      <header className="p-6 sm:p-8 rounded-3xl bg-[#EAF8F1] border border-emerald-200/80 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              전체 팀게임 순위
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
            <div className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-white border border-emerald-200 shadow-sm text-center">
              <span className="text-sm font-bold text-stone-500 block">참여 팀</span>
              <strong className="text-xl sm:text-2xl font-black text-emerald-700 block mt-0.5">
                {standings.length}팀
              </strong>
            </div>
            {champion && (
              <div className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-white border border-amber-200 shadow-sm text-center">
                <span className="text-sm font-bold text-stone-500 block">현재 1위 팀</span>
                <strong className="text-lg sm:text-xl font-black text-amber-600 block mt-0.5 truncate max-w-[150px]">
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
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-sm text-stone-500 font-semibold text-base">
            등록된 팀 기록이 없습니다.
          </div>
        ) : (
          standings.map((team) => {
            const rankBadgeClass =
              team.rank === 1
                ? "bg-amber-100 text-amber-900 border-amber-300 font-black"
                : team.rank === 2
                  ? "bg-slate-100 text-slate-800 border-slate-300 font-black"
                  : team.rank === 3
                    ? "bg-orange-100 text-orange-900 border-orange-300 font-black"
                    : "bg-stone-100 text-stone-600 border-stone-200 font-bold";

            const medalEmoji =
              team.rank === 1 ? "🥇" : team.rank === 2 ? "🥈" : team.rank === 3 ? "🥉" : null;

            return (
              <div
                key={team.id}
                className="p-4 sm:p-6 bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                {/* Main Row */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-base shrink-0 ${rankBadgeClass}`}
                    >
                      {medalEmoji || `${team.rank}위`}
                    </span>
                    <div className="min-w-0">
                      <strong className="block text-lg sm:text-xl font-black text-stone-900 truncate">
                        {team.teamName}
                      </strong>
                      <span className="text-sm font-semibold text-stone-500 truncate block">
                        {team.departmentName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-500">종합 점수</span>
                    <b className="text-xl sm:text-2xl font-black text-stone-900">
                      {team.score.toLocaleString("ko-KR")}
                      <span className="text-sm font-bold ml-0.5">점</span>
                    </b>
                  </div>
                </div>

                {/* Game Breakdown List: 각 게임별로 몇점인지 */}
                {team.gameScores.length > 0 && (
                  <div className="pt-3 border-t border-stone-100 flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-stone-400 mr-1">게임별 점수:</span>
                    {team.gameScores.map((game) => (
                      <div
                        key={game.gameId}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-50 border border-stone-200/80 text-sm font-semibold text-stone-700"
                      >
                        <span>{game.emoji}</span>
                        <span className="font-bold text-stone-800">{game.gameName}</span>
                        <b className="text-emerald-700 font-black ml-0.5">
                          {game.score.toLocaleString("ko-KR")}점
                        </b>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
