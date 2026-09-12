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
    <div className="site-shell py-8 sm:py-12">
      <RankingAutoRefresh />

      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/departments"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold text-sm shadow-sm hover:bg-stone-50 transition-colors"
        >
          ← 전체 학과 순위 목록
        </Link>
      </div>

      {/* Department Hero Header */}
      <header className="p-6 sm:p-8 rounded-3xl bg-[#FFF9EC] border border-amber-200/80 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              {department.name}
            </h1>
          </div>

          {standing ? (
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
              <div className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-white border border-amber-200 shadow-sm text-center">
                <span className="text-sm font-bold text-stone-500 block">종합 순위</span>
                <strong className="text-xl sm:text-2xl font-black text-amber-600 block mt-0.5">
                  {standing.rank}위
                </strong>
              </div>
              <div className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-white border border-amber-200 shadow-sm text-center">
                <span className="text-sm font-bold text-stone-500 block">학과 총점</span>
                <strong className="text-xl sm:text-2xl font-black text-stone-900 block mt-0.5">
                  {standing.totalScore.toLocaleString("ko-KR")}점
                </strong>
              </div>
              <div className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-white border border-amber-200 shadow-sm text-center">
                <span className="text-sm font-bold text-stone-500 block">참여 인원</span>
                <strong className="text-xl sm:text-2xl font-black text-stone-700 block mt-0.5">
                  {standing.playerCount}명
                </strong>
              </div>
            </div>
          ) : (
            <p className="text-sm font-semibold text-stone-500">
              아직 등록된 기록이 없는 학과입니다.
            </p>
          )}
        </div>

        {/* Highlighted Total Score Sum Breakdown: 각 게임별 1등 점수만 추출하여 합산 */}
        {standing && (
          <div className="mt-6 pt-6 border-t border-amber-200/80">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
              <h3 className="text-base font-black text-stone-900 flex items-center gap-1.5">
                <span>🎯</span> 게임별 1위 합산 총점 내역
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {breakdown.map((item, idx) => (
                <React.Fragment key={item.game.id}>
                  {idx > 0 && <span className="text-stone-400 font-bold text-base">+</span>}
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-amber-200 shadow-sm text-sm">
                    <span>{item.game.emoji}</span>
                    <span className="font-bold text-stone-800">{item.game.name}</span>
                    {item.bestScore ? (
                      <>
                        <span className="font-semibold text-stone-500 text-sm">
                          ({item.bestScore.nickname})
                        </span>
                        <b className="font-black text-amber-700 text-base">
                          {item.subtotal.toLocaleString("ko-KR")}점
                        </b>
                      </>
                    ) : (
                      <span className="text-stone-400 font-semibold text-sm">0점</span>
                    )}
                  </div>
                </React.Fragment>
              ))}
              <span className="text-stone-400 font-bold text-base">=</span>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-200 text-amber-950 font-black text-base shadow-sm">
                총점 {standing.totalScore.toLocaleString("ko-KR")}점
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Game-by-Game Breakdown: Table / Cards */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-stone-900">
            게임별 성적 및 전체 참가 기록
          </h2>
        </div>

        {activeBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {breakdown.map(
              ({ game, allScores, bestScore, departmentRankInGame }) => {
                const hasScore = allScores.length > 0;

                return (
                  <div
                    key={game.id}
                    className={`p-5 sm:p-6 rounded-3xl border bg-white shadow-sm flex flex-col justify-between transition-all ${
                      hasScore ? "border-stone-200" : "border-stone-200/60 opacity-60"
                    }`}
                  >
                    <div>
                      {/* Card Top: Game info + department stats */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-11 h-11 rounded-2xl bg-stone-100 flex items-center justify-center text-2xl shrink-0">
                            {game.emoji}
                          </span>
                          <div>
                            <strong className="block text-lg font-black text-stone-900 leading-tight">
                              {game.name}
                            </strong>
                            <span className="text-sm font-bold text-stone-500 mt-0.5 block">
                              {game.rankingMode === "team" ? "협동 팀전" : "개인전"}
                            </span>
                          </div>
                        </div>

                        {hasScore && (
                          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-sm shrink-0">
                            전체 학과 {departmentRankInGame}위
                          </div>
                        )}
                      </div>

                      {/* 1등만 따로 뺀 총점 합산 반영 박스 */}
                      {hasScore && bestScore ? (
                        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm flex items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-10 h-10 rounded-xl bg-amber-400 text-stone-900 flex items-center justify-center font-black text-lg shrink-0">
                              🏆
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-black px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-900">
                                  학과 1위
                                </span>
                                <strong className="text-base font-black text-stone-900 truncate">
                                  {bestScore.nickname}
                                </strong>
                              </div>
                            </div>
                          </div>
                          <b className="text-xl sm:text-2xl font-black text-amber-900 shrink-0">
                            {bestScore.score.toLocaleString("ko-KR")}점
                          </b>
                        </div>
                      ) : (
                        <div className="p-4 text-center rounded-2xl bg-stone-50 text-stone-500 font-semibold text-sm mb-4">
                          아직 등록된 기록이 없습니다.
                        </div>
                      )}

                      {/* 전체 다 보여주는 학과 내 전체 순위 목록 */}
                      {allScores.length > 0 && (
                        <div className="space-y-1.5 pt-3 border-t border-stone-100">
                          <div className="flex items-center justify-between text-sm font-bold text-stone-600 mb-2">
                            <span>학과 내 전체 참가자 기록</span>
                            <span>총 {allScores.length}명 참여</span>
                          </div>
                          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                            {allScores.map((score) => {
                              const isFirst = score.isDepartmentFirst;
                              return (
                                <div
                                  key={score.id}
                                  className={`flex items-center justify-between text-sm py-2 px-3 rounded-xl transition-colors ${
                                    isFirst
                                      ? "bg-amber-100/60 font-bold border border-amber-300/80"
                                      : "bg-stone-50 hover:bg-stone-100 text-stone-700"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span
                                      className={`w-6 text-center font-black text-sm ${
                                        isFirst ? "text-amber-800" : "text-stone-500"
                                      }`}
                                    >
                                      {score.rank}위
                                    </span>
                                    <span className="font-extrabold text-stone-900 truncate">
                                      {score.nickname}
                                    </span>
                                  </div>
                                  <span
                                    className={`font-black text-base shrink-0 ${
                                      isFirst ? "text-amber-900" : "text-stone-800"
                                    }`}
                                  >
                                    {score.score.toLocaleString("ko-KR")}점
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-sm">
            <h3 className="text-lg font-black text-stone-800 mb-2">
              아직 등록된 게임 기록이 없습니다.
            </h3>
            <p className="text-sm font-semibold text-stone-500 mb-6">
              부스에서 미니게임에 도전해 {department.name}의 첫 번째 기록을 남겨보세요!
            </p>
            <Link
              href="/#game-rankings"
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-amber-400 text-stone-900 font-black text-sm shadow-sm hover:bg-amber-300 transition-colors"
            >
              5종 미니게임 보러가기
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
