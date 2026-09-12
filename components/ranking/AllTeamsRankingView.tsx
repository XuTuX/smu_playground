"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { TeamStanding } from "@/lib/types";

export function AllTeamsRankingView({
  standings,
}: {
  standings: TeamStanding[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = standings.filter((t) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return (
      t.teamName.toLowerCase().includes(query) ||
      t.departmentName.toLowerCase().includes(query) ||
      t.gameName.toLowerCase().includes(query)
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
      <header className="p-6 sm:p-8 rounded-3xl bg-[#EAF8F1] border border-emerald-200/80 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 font-black text-sm mb-2">
              팀게임 순위
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              전체 팀게임 순위
            </h1>
            <p className="text-sm font-semibold text-stone-600 mt-1">
              협동 팀전 미니게임에서 기록한 팀별 최고 점수 랭킹입니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="px-5 py-3 rounded-2xl bg-white border border-emerald-200 shadow-sm text-center min-w-[110px]">
              <span className="text-sm font-bold text-stone-500 block">참여 팀</span>
              <strong className="text-2xl font-black text-emerald-700 block mt-0.5">
                {standings.length}팀
              </strong>
            </div>
            {champion && (
              <div className="px-5 py-3 rounded-2xl bg-white border border-amber-200 shadow-sm text-center min-w-[140px]">
                <span className="text-sm font-bold text-stone-500 block">현재 1위 팀</span>
                <strong className="text-xl font-black text-amber-600 block mt-0.5 truncate max-w-[150px]">
                  {champion.teamName}
                </strong>
                <span className="text-xs font-bold text-stone-500 block mt-0.5 truncate">
                  {champion.departmentName} ({champion.score.toLocaleString("ko-KR")}점)
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
            placeholder="팀명, 소속 학과 또는 게임명 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-4 text-base font-semibold bg-white border border-stone-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
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
            등록된 팀 기록이 없습니다.
          </div>
        ) : (
          filtered.map((team) => {
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
                className="p-5 sm:p-6 bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span
                    className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-base shrink-0 ${rankBadgeClass}`}
                  >
                    {medalEmoji || `${team.rank}위`}
                  </span>
                  <div className="min-w-0">
                    <strong className="block text-lg sm:text-xl font-black text-stone-900 truncate">
                      {team.teamName}
                    </strong>
                    <div className="flex items-center gap-2 text-sm font-semibold text-stone-500 mt-0.5">
                      <span className="font-bold text-stone-700">{team.departmentName}</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-bold">
                        {team.emoji} {team.gameName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-auto">
                  <span className="text-sm font-bold text-stone-500">점수</span>
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
