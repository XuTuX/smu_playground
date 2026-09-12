import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { PressableLink } from "@/components/ui/PressableLink";
import { RetroCard } from "@/components/ui/RetroCard";
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
  return { title: department ? `${department.name} 순위` : "학과 기록" };
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
  const breakdown = getDepartmentGameBreakdown(scores, department.id).filter(
    ({ topScores }) => topScores.length > 0,
  );

  return (
    <div className="site-shell department-detail">
      <RankingAutoRefresh />
      <div className="page-back-nav">
        <PressableLink href="/departments" className="pressable-cream page-back-button">
          ← 전체 학과 순위
        </PressableLink>
      </div>

      <header className="department-detail-hero">
        <h1>{department.name}</h1>
        {standing ? (
          <div className="department-stat-boxes">
            <span>
              현재 종합 순위 <strong>{standing.rank}위</strong>
            </span>
            <span>
              종합 합산 점수 <strong>{standing.totalScore.toLocaleString("ko-KR")}점</strong>
            </span>
            <span>
              참여 인원 <strong>{standing.playerCount}명</strong>
            </span>
          </div>
        ) : (
          <p className="department-hero-notice">아직 등록된 기록이 없는 학과입니다.</p>
        )}
      </header>

      {breakdown.length > 0 ? (
        <section className="section-block">
          <div className="section-heading">
            <h2>게임별 상위 기록</h2>
          </div>
          <div className="breakdown-grid">
            {breakdown.map(({ game, topScores, subtotal }) => (
              <RetroCard accent={game.accent} className="breakdown-card" key={game.id}>
                <div className="breakdown-card-top">
                  <span className="breakdown-emoji" aria-hidden="true">
                    {game.emoji}
                  </span>
                  <h3>{game.name}</h3>
                </div>
                <ol>
                  {topScores.map((score, index) => (
                    <li key={score.id}>
                      <span className="breakdown-rank">{index + 1}</span>
                      <strong className="breakdown-nickname">{score.nickname}</strong>
                      <b className="breakdown-score">{score.score.toLocaleString("ko-KR")}점</b>
                    </li>
                  ))}
                </ol>
                <p>
                  상위 합계 <strong>{subtotal.toLocaleString("ko-KR")}점</strong>
                </p>
              </RetroCard>
            ))}
          </div>
        </section>
      ) : (
        <section className="section-block">
          <RetroCard className="department-empty-card">
            <EmptyState
              title="아직 등록된 게임 기록이 없어요!"
              description={`${department.name} 학생 여러분, 부스에서 미니게임에 도전해 우리 과 첫 기록을 세워보세요!`}
              actionText="5종 게임 보러가기"
              actionHref="/?tab=game"
            />
          </RetroCard>
        </section>
      )}
    </div>
  );
}
