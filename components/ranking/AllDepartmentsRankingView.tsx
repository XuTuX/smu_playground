import React from "react";
import Link from "next/link";
import type { DepartmentStanding } from "@/lib/types";

export function AllDepartmentsRankingView({
  standings,
}: {
  standings: DepartmentStanding[];
}) {
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
      <header className="p-6 sm:p-8 rounded-3xl bg-[#FFF9EC] border border-amber-200/80 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-amber-200 text-amber-900 font-black text-sm mb-2">
              학과 순위
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              전체 학과 순위
            </h1>
            <p className="text-sm font-semibold text-stone-600 mt-1">
              각 게임에서 학과별 상위 5개 기록을 합산한 종합 학과 랭킹입니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="px-5 py-3 rounded-2xl bg-white border border-amber-200 shadow-sm text-center min-w-[110px]">
              <span className="text-sm font-bold text-stone-500 block">참여 학과</span>
              <strong className="text-2xl font-black text-stone-900 block mt-0.5">
                {standings.length}개 학과
              </strong>
            </div>
            {champion && (
              <div className="px-5 py-3 rounded-2xl bg-white border border-amber-200 shadow-sm text-center min-w-[140px]">
                <span className="text-sm font-bold text-stone-500 block">현재 1위 학과</span>
                <strong className="text-xl font-black text-amber-600 block mt-0.5 truncate max-w-[150px]">
                  {champion.departmentName}
                </strong>
                <span className="text-xs font-bold text-stone-500 block mt-0.5">
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
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-sm text-stone-500 font-semibold text-base">
            등록된 학과 기록이 없습니다.
          </div>
        ) : (
          standings.map((standing) => {
            const rankBadgeClass =
              standing.rank === 1
                ? "bg-amber-100 text-amber-900 border-amber-300 font-black"
                : standing.rank === 2
                  ? "bg-slate-100 text-slate-800 border-slate-300 font-black"
                  : standing.rank === 3
                    ? "bg-orange-100 text-orange-900 border-orange-300 font-black"
                    : "bg-stone-100 text-stone-600 border-stone-200 font-bold";

            const medalEmoji =
              standing.rank === 1 ? "🥇" : standing.rank === 2 ? "🥈" : standing.rank === 3 ? "🥉" : null;

            return (
              <Link
                key={standing.departmentId}
                href={`/departments/${standing.departmentId}`}
                className="p-5 sm:p-6 bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between gap-4 flex-wrap group block"
                title={`${standing.departmentName} 상세 성적 보기`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span
                    className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-base shrink-0 ${rankBadgeClass}`}
                  >
                    {medalEmoji || `${standing.rank}위`}
                  </span>
                  <div className="min-w-0">
                    <strong className="block text-lg sm:text-xl font-black text-stone-900 truncate group-hover:text-amber-600 transition-colors">
                      {standing.departmentName}
                    </strong>
                    <span className="text-sm font-semibold text-stone-500 mt-0.5 block">
                      참가자 {standing.playerCount}명
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 ml-auto">
                  <div className="text-right">
                    <span className="text-sm font-bold text-stone-500 block">합산 점수</span>
                    <b className="text-xl sm:text-2xl font-black text-stone-900">
                      {standing.totalScore.toLocaleString("ko-KR")}
                      <span className="text-sm font-bold ml-0.5">점</span>
                    </b>
                  </div>
                  <span className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-900 transition-colors shrink-0">
                    ›
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
