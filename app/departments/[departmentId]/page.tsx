import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { RankingAutoRefresh } from "@/components/ranking/RankingAutoRefresh";
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
  return { title: department ? `${department.name} - 학과 상세 순위` : "학과 기록" };
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
  const activeBreakdown = breakdown.filter(({ allScores }) => allScores.length > 0);

  return (
    <div className="site-shell py-6 sm:py-12">
      <RankingAutoRefresh />

      {/* Back */}
      <div className="mb-5">
        <Link
          href="/departments"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold text-sm shadow-sm hover:bg-stone-50 transition-colors"
        >
          ← 전체 학과 순위
        </Link>
      </div>

      {/* Header: 학과 이름 + 핵심 숫자 */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          {department.name}
        </h1>

        {standing ? (
          <div className="flex items-baseline gap-4 sm:gap-6 mt-3 flex-wrap">
            <span className="text-lg font-black text-amber-600">
              종합 {standing.rank}위
            </span>
            <span className="text-lg font-black text-stone-900">
              {standing.totalScore.toLocaleString("ko-KR")}점
            </span>
            <span className="text-base font-bold text-stone-500">
              {standing.playerCount}명 참여
            </span>
          </div>
        ) : (
          <p className="text-base font-semibold text-stone-500 mt-2">
            아직 등록된 기록이 없는 학과입니다.
          </p>
        )}
      </header>

      {/* 총점 산출: 한 줄 요약 */}
      {standing && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-[#FFF9EC] border border-amber-200/80">
          <div className="flex items-center gap-2 flex-wrap text-base">
            {breakdown.map((item, idx) => (
              <React.Fragment key={item.game.id}>
                {idx > 0 && <span className="text-stone-400 font-bold">+</span>}
                <span className="inline-flex items-center gap-1.5 font-bold text-stone-800">
                  <span>{item.game.emoji}</span>
                  <b className="text-amber-700">
                    {item.subtotal.toLocaleString("ko-KR")}
                  </b>
                </span>
              </React.Fragment>
            ))}
            <span className="text-stone-400 font-bold">=</span>
            <b className="text-amber-800 text-lg">
              {standing.totalScore.toLocaleString("ko-KR")}점
            </b>
          </div>
        </div>
      )}

      {/* 게임별 성적 카드 */}
      {activeBreakdown.length > 0 ? (
        <div className="space-y-4 sm:space-y-5">
          {breakdown.map(
            ({ game, allScores, bestScore, departmentRankInGame }) => {
              const hasScore = allScores.length > 0;

              return (
                <div
                  key={game.id}
                  className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${
                    hasScore ? "border-stone-200" : "border-stone-200/60 opacity-50"
                  }`}
                >
                  {/* 게임 헤더 */}
                  <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 border-b border-stone-100">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{game.emoji}</span>
                      <strong className="text-base sm:text-lg font-black text-stone-900">
                        {game.name}
                      </strong>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {hasScore && bestScore && (
                        <span className="text-lg sm:text-xl font-black text-amber-700">
                          {bestScore.score.toLocaleString("ko-KR")}점
                        </span>
                      )}
                      {hasScore && (
                        <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 font-black text-sm">
                          {departmentRankInGame}위
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 참가자 리스트 */}
                  {allScores.length > 0 && (
                    <div className="px-4 py-3 sm:px-5 sm:py-4 space-y-1.5">
                      {allScores.map((score) => {
                        const isFirst = score.isDepartmentFirst;
                        return (
                          <div
                            key={score.id}
                            className={`flex items-center justify-between py-2 px-3 rounded-xl text-sm ${
                              isFirst
                                ? "bg-amber-50 border border-amber-200/80 font-bold"
                                : "text-stone-700"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-6 text-center font-black ${
                                  isFirst ? "text-amber-700" : "text-stone-400"
                                }`}
                              >
                                {score.rank}
                              </span>
                              <span className="font-bold text-stone-900 truncate">
                                {score.nickname}
                              </span>
                            </div>
                            <span
                              className={`font-black shrink-0 ${
                                isFirst ? "text-amber-700" : "text-stone-600"
                              }`}
                            >
                              {score.score.toLocaleString("ko-KR")}점
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!hasScore && (
                    <div className="px-4 py-6 text-center text-stone-400 font-semibold text-sm">
                      기록 없음
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>
      ) : (
        <div className="p-10 text-center bg-white rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="text-lg font-black text-stone-800 mb-2">
            아직 등록된 게임 기록이 없습니다.
          </h3>
          <p className="text-sm font-semibold text-stone-500 mb-5">
            부스에서 미니게임에 도전해 {department.name}의 첫 기록을 남겨보세요!
          </p>
          <Link
            href="/#game-rankings"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-amber-400 text-stone-900 font-black text-sm shadow-sm hover:bg-amber-300 transition-colors"
          >
            미니게임 보러가기
          </Link>
        </div>
      )}
    </div>
  );
}
