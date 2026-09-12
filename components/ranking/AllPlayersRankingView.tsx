import React from "react";
import type { DetailedPlayerStanding } from "@/lib/types";

export function AllPlayersRankingView({
  standings,
}: {
  standings: DetailedPlayerStanding[];
}) {
  const champion = standings[0];

  return (
    <div className="py-6 sm:py-10">

      {/* Hero Header */}
      <header className="p-6 sm:p-8 rounded-3xl bg-[#EEF6FF] shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              전체 개인 순위
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
            {champion && (
              <div className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-white shadow-sm text-center">
                <span className="text-sm font-bold text-stone-500 block">현재 1위</span>
                <strong className="text-lg sm:text-xl font-black text-amber-600 block mt-0.5 break-keep-all">
                  {champion.nickname}
                </strong>
                <span className="text-sm font-bold text-stone-400 block mt-0.5">
                  {champion.totalScore.toLocaleString("ko-KR")}점
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
            등록된 참가자 기록이 없습니다.
          </div>
        ) : (
          standings.map((player) => {
            const rankBadgeClass =
              player.rank === 1
                ? "bg-amber-100 text-amber-900 font-black"
                : player.rank === 2
                  ? "bg-slate-100 text-slate-800 font-black"
                  : player.rank === 3
                    ? "bg-orange-100 text-orange-900 font-black"
                    : "bg-stone-100 text-stone-600 font-bold";

            const medalEmoji =
              player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : player.rank === 3 ? "🥉" : null;

            return (
              <div
                key={player.id}
                className="p-4 sm:p-6 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
              >
                {/* Main Row */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base shrink-0 ${rankBadgeClass}`}
                    >
                      {medalEmoji || `${player.rank}위`}
                    </span>
                    <div className="min-w-0">
                      <strong className="block text-lg sm:text-xl font-black text-stone-900 truncate">
                        {player.nickname}
                      </strong>
                      <span className="text-sm font-semibold text-stone-500 truncate block">
                        {player.departmentName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-500">종합 점수</span>
                    <b className="text-xl sm:text-2xl font-black text-stone-900">
                      {player.totalScore.toLocaleString("ko-KR")}
                      <span className="text-sm font-bold ml-0.5">점</span>
                    </b>
                  </div>
                </div>

                {/* Game Breakdown List: 각 게임별로 몇 점 받아 총 몇 점인지 */}
                {player.gameScores.length > 0 && (
                  <div className="pt-3 border-t border-stone-100 flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-stone-400 mr-1">게임별 점수:</span>
                    {player.gameScores.map((game) => (
                      <div
                        key={game.gameId}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-50 text-sm font-semibold text-stone-700"
                      >
                        <span>{game.emoji}</span>
                        <span className="font-bold text-stone-800">{game.gameName}</span>
                        <b className="text-sky-700 font-black ml-0.5">
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
