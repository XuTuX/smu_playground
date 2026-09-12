import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { RankingAutoRefresh } from "@/components/ranking/RankingAutoRefresh";
import { DepartmentGameTabs } from "@/components/ranking/DepartmentGameTabs";
import { departments, getDepartment } from "@/data/departments";
import { getAllScores } from "@/lib/score-store";
import { getDepartmentGameBreakdown, getDepartmentStandings } from "@/lib/ranking";

export function generateStaticParams() {
  return departments.map((department) => ({ departmentId: department.id }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}): Promise<Metadata> {
  const department = getDepartment((await params).departmentId);
  return { title: department ? `${department.name} - 학과 순위` : "학과 기록" };
}

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}) {
  const department = getDepartment((await params).departmentId);
  if (!department) notFound();

  const scores = await getAllScores();
  const standing = getDepartmentStandings(scores).find(
    ({ departmentId }) => departmentId === department.id,
  );
  const breakdown = getDepartmentGameBreakdown(scores, department.id);

  return (
    <div className="site-shell py-6 sm:py-10">
      <RankingAutoRefresh />

      {/* 뒤로가기 */}
      <div className="mb-5">
        <Link
          href="/departments"
          className="inline-flex items-center text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors"
        >
          ← 전체 학과 순위
        </Link>
      </div>

      {/* 학과 정보 헤더 */}
      <header className="pb-6 border-b border-stone-200">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          {department.name}
        </h1>

        {standing ? (
          <div className="flex items-center gap-3 sm:gap-4 mt-3 text-sm sm:text-base font-semibold text-stone-600 flex-wrap">
            <span>
              종합 <strong className="font-black text-stone-900">{standing.rank}위</strong>
            </span>
            <span className="text-stone-300">·</span>
            <span>
              총점 <strong className="font-black text-stone-900">{standing.totalScore.toLocaleString("ko-KR")}점</strong>
            </span>
            <span className="text-stone-300">·</span>
            <span>
              참여 <strong className="font-black text-stone-900">{standing.playerCount}명</strong>
            </span>
          </div>
        ) : (
          <p className="text-sm font-semibold text-stone-500 mt-2">
            아직 등록된 게임 기록이 없습니다.
          </p>
        )}
      </header>

      {/* 게임별 1등 점수 탭 & 하단 세로 랭킹 */}
      {standing ? (
        <section className="py-7">
          <DepartmentGameTabs breakdown={breakdown} />
        </section>
      ) : (
        <div className="p-10 text-center bg-white rounded-2xl border border-stone-200 shadow-sm mt-6">
          <p className="text-base font-bold text-stone-700 mb-4">
            아직 참가 기록이 없습니다.
          </p>
          <Link
            href="/#game-rankings"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 transition-colors"
          >
            게임 보러가기
          </Link>
        </div>
      )}
    </div>
  );
}
