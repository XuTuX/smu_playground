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
  const activeBreakdown = breakdown.filter(({ topScores }) => topScores.length > 0);

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
            <div className="inline-block px-3 py-1 rounded-full bg-amber-200 text-amber-900 font-black text-sm mb-2">
              학과 랭킹 상세
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              {department.name}
            </h1>
          </div>

          {standing ? (
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="px-5 py-3 rounded-2xl bg-white border border-amber-200 shadow-sm text-center min-w-[100px]">
                <span className="text-sm font-bold text-stone-500 block">종합 순위</span>
                <strong className="text-2xl font-black text-amber-600 block mt-0.5">
                  {standing.rank}위
                </strong>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-white border border-amber-200 shadow-sm text-center min-w-[120px]">
                <span className="text-sm font-bold text-stone-500 block">학과 총점</span>
                <strong className="text-2xl font-black text-stone-900 block mt-0.5">
                  {standing.totalScore.toLocaleString("ko-KR")}점
                </strong>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-white border border-amber-200 shadow-sm text-center min-w-[90px]">
                <span className="text-sm font-bold text-stone-500 block">참여 인원</span>
                <strong className="text-2xl font-black text-stone-700 block mt-0.5">
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
      </header>

      {/* Game-by-Game Breakdown: Table / Cards */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-stone-900">
            게임별 성적 및 최고 득점자
          </h2>
          <span className="text-xs sm:text-sm font-semibold text-stone-500">
            게임별 학과 1위 기록 합산 기준
          </span>
        </div>

        {activeBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {breakdown.map(({ game, topScores, subtotal, departmentRankInGame, topPerformer }) => {
              const hasScore = topScores.length > 0;

              return (
                <div
                  key={game.id}
                  className={`p-5 sm:p-6 rounded-3xl border bg-white shadow-sm flex flex-col justify-between transition-all ${
                    hasScore ? "border-stone-200" : "border-stone-200/60 opacity-60"
                  }`}
                >
                  {/* Card Top: Game info + department stats */}
                  <div>
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
                          학과 {departmentRankInGame}위
                        </div>
                      )}
                    </div>

                    {/* Highlighted Row (예: Counting Star | 1,250점 | 학과 1위 | 김민준 420점) */}
                    {hasScore ? (
                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between flex-wrap gap-2 text-sm font-bold text-stone-700 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-stone-500">획득 점수:</span>
                          <b className="text-stone-900 text-base font-black">
                            {subtotal.toLocaleString("ko-KR")}점
                          </b>
                        </div>
                        {topPerformer && (
                          <div className="flex items-center gap-1.5 text-sm">
                            <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-800 font-extrabold text-xs">
                              최고 득점자
                            </span>
                            <span className="font-extrabold text-stone-900">
                              {topPerformer.nickname}
                            </span>
                            <span className="text-amber-700 font-black">
                              ({topPerformer.score.toLocaleString("ko-KR")}점)
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 text-center rounded-2xl bg-stone-50 text-stone-400 font-semibold text-sm mb-4">
                        아직 기록이 등록되지 않았습니다.
                      </div>
                    )}

                    {/* Department winner for this game */}
                    {topScores.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-stone-100">
                        <div className="text-sm font-bold text-stone-500 mb-2">
                          학과 내 1위 기록
                        </div>
                        {topScores.map((score, idx) => (
                          <div
                            key={score.id}
                            className="flex items-center justify-between text-sm py-1 px-2 rounded-lg hover:bg-stone-50"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 font-bold text-stone-500 text-sm">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-stone-800 truncate">
                                {score.nickname}
                              </span>
                            </div>
                            <span className="font-black text-stone-900 shrink-0">
                              {score.score.toLocaleString("ko-KR")}점
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
