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
      {/* Hero Header */}
      <header className="p-6 sm:p-8 rounded-3xl bg-[#FFF9EC] shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              전체 학과 순위
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
            {champion && (
              <div className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-white shadow-sm text-center">
                <span className="text-sm font-bold text-stone-500 block">현재 1위 학과</span>
                <strong className="text-lg sm:text-xl font-black text-amber-600 block mt-0.5 break-keep-all">
                  {champion.departmentName}
                </strong>
                <span className="text-sm font-bold text-stone-500 block mt-0.5">
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
            등록된 학과 기록이 없습니다.
          </div>
        ) : (
          standings.map((standing) => {
            const rankBadgeClass =
              standing.rank === 1
                ? "bg-amber-100 text-amber-900 font-black"
                : standing.rank === 2
                  ? "bg-slate-100 text-slate-800 font-black"
                  : standing.rank === 3
                    ? "bg-orange-100 text-orange-900 font-black"
                    : "bg-stone-100 text-stone-600 font-bold";

            const medalEmoji =
              standing.rank === 1 ? "🥇" : standing.rank === 2 ? "🥈" : standing.rank === 3 ? "🥉" : null;

            return (
              <Link
                key={standing.departmentId}
                href={`/departments/${standing.departmentId}`}
                className="p-4 sm:p-6 bg-white rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between gap-3 sm:gap-4 group block"
                title={`${standing.departmentName} 상세 성적 보기`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base shrink-0 ${rankBadgeClass}`}
                  >
                    {medalEmoji || `${standing.rank}위`}
                  </span>
                  <div className="min-w-0">
                    <strong className="block text-lg sm:text-xl font-black text-stone-900 truncate group-hover:text-amber-600 transition-colors">
                      {standing.departmentName}
                    </strong>
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
                  <span className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-900 transition-colors shrink-0">
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
