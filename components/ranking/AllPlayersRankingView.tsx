"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { DetailedPlayerStanding } from "@/lib/types";

export function AllPlayersRankingView({
  standings,
}: {
  standings: DetailedPlayerStanding[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = standings.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return (
      p.nickname.toLowerCase().includes(query) ||
      p.departmentName.toLowerCase().includes(query)
    );
  });

  const champion = standings[0];

  return (
    <div className="py-6 sm:py-10">
      {/* Top Navigation */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold text-sm shadow-sm hover:bg-stone-50 transition-colors"
        >
          ← 메인 홈으로
        </Link>
      </div>

      {/* Hero Header */}
      <header className="p-6 sm:p-8 rounded-3xl bg-[#EEF6FF] border border-sky-200/80 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-sky-200 text-sky-900 font-black text-sm mb-2">
              개인 순위
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              전체 개인 순위
            </h1>
            <p className="text-sm font-semibold text-stone-600 mt-1">
              각 게임에서 획득한 최고 점수를 합산한 종합 개인 랭킹입니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="px-5 py-3 rounded-2xl bg-white border border-sky-200 shadow-sm text-center min-w-[110px]">
              <span className="text-sm font-bold text-stone-500 block">총 참가자</span>
              <strong className="text-2xl font-black text-sky-700 block mt-0.5">
                {standings.length}명
              </strong>
            </div>
            {champion && (
              <div className="px-5 py-3 rounded-2xl bg-white border border-amber-200 shadow-sm text-center min-w-[130px]">
                <span className="text-sm font-bold text-stone-500 block">현재 1위</span>
                <strong className="text-xl font-black text-amber-600 block mt-0.5 truncate max-w-[140px]">
                  {champion.nickname}
                </strong>
                <span className="text-xs font-bold text-stone-400 block mt-0.5">
                  {champion.totalScore.toLocaleString("ko-KR")}점
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="search"
            placeholder="이름 또는 소속 학과 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-4 text-base font-semibold bg-white border border-stone-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">
            🔍
          </span>
        </div>
      </div>

      {/* Ranking List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-sm text-stone-500 font-semibold text-base">
            등록된 참가자 기록이 없습니다.
          </div>
        ) : (
          filtered.map((player) => {
            const rankBadgeClass =
              player.rank === 1
                ? "bg-amber-100 text-amber-900 border-amber-300 font-black"
                : player.rank === 2
                  ? "bg-slate-100 text-slate-800 border-slate-300 font-black"
                  : player.rank === 3
                    ? "bg-orange-100 text-orange-900 border-orange-300 font-black"
                    : "bg-stone-100 text-stone-600 border-stone-200 font-bold";

            const medalEmoji =
              player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : player.rank === 3 ? "🥉" : null;

            return (
              <div
                key={player.id}
                className="p-5 sm:p-6 bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
              >
                {/* Main Row */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-base shrink-0 ${rankBadgeClass}`}
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
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-50 border border-stone-200/80 text-sm font-semibold text-stone-700"
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
