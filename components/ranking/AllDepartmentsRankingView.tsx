import React from "react";
import Link from "next/link";
import type { DepartmentStanding } from "@/lib/types";
import { TopThreePodium, type TopThreePodiumItem } from "./TopThreePodium";

export function AllDepartmentsRankingView({
  standings,
}: {
  standings: DepartmentStanding[];
}) {
  const topThreeItems: TopThreePodiumItem[] = standings
    .filter((s) => s.rank <= 3)
    .map((s) => ({
      rank: s.rank as 1 | 2 | 3,
      primaryText: s.departmentName,
      score: s.totalScore,
      href: `/departments/${s.departmentId}`,
    }));

  const remainingStandings = standings.filter((s) => s.rank > 3);

  return (
    <div className="py-6 sm:py-10">
      {/* Hero Header with Top 1, 2, 3 Podium */}
      <header className="p-5 sm:p-8 rounded-3xl bg-[#FFF9EC] shadow-sm mb-8 overflow-hidden">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            전체 학과 순위
          </h1>
        </div>

        {/* Top 3 Podium */}
        <TopThreePodium items={topThreeItems} theme="yellow" />
      </header>

      {/* 4th Place and Below Ranking List */}
      <div>
        {standings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl shadow-sm text-stone-500 font-semibold text-base">
            등록된 학과 기록이 없습니다.
          </div>
        ) : remainingStandings.length > 0 ? (
          <div className="space-y-3">
            {remainingStandings.map((standing) => (
                <Link
                  key={standing.departmentId}
                  href={`/departments/${standing.departmentId}`}
                  className="p-4 sm:p-5 bg-white rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between gap-3 sm:gap-4 group block"
                  title={`${standing.departmentName} 상세 성적 보기`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm sm:text-base shrink-0 bg-stone-100 text-stone-600 font-extrabold">
                      {standing.rank}위
                    </span>
                    <div className="min-w-0">
                      <strong className="block text-base sm:text-lg font-black text-stone-900 truncate group-hover:text-amber-600 transition-colors">
                        {standing.departmentName}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0 ml-auto">
                    <div className="text-right">
                      <span className="text-sm font-bold text-stone-500 block">합산 점수</span>
                      <b className="text-lg sm:text-xl font-black text-stone-900">
                        {standing.totalScore.toLocaleString("ko-KR")}
                        <span className="text-sm font-bold ml-0.5">점</span>
                      </b>
                    </div>
                    <span className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-900 transition-colors shrink-0">
                      ›
                    </span>
                  </div>
                </Link>
              ))}
            </div>
        ) : null}
      </div>
    </div>
  );
}
