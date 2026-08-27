import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PressableLink } from "@/components/ui/PressableLink";
import { getDepartment } from "@/data/departments";
import { getGame } from "@/data/games";
import { getAllScores } from "@/lib/mock-store";
import { getDepartmentStandings, getPlayerStandings } from "@/lib/ranking";

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ scoreId: string }> }): Promise<Metadata> {
  const { scoreId } = await params;
  const score = getAllScores().find(({ id }) => id === scoreId);
  return { title: score ? `${score.nickname} 기록` : "기록 상세" };
}

export default async function ScoreDetailPage({ params }: { params: Promise<{ scoreId: string }> }) {
  const { scoreId } = await params;
  const scores = getAllScores();
  const score = scores.find(({ id }) => id === scoreId);
  if (!score) notFound();

  const game = getGame(score.gameId);
  const department = getDepartment(score.departmentId);
  if (!game || !department) notFound();

  const overallRank = getPlayerStandings(scores).find(({ id }) => id === score.id)?.rank;
  const gameRank = getPlayerStandings(scores, { gameId: score.gameId }).find(({ id }) => id === score.id)?.rank;
  const departmentRank = getDepartmentStandings(scores).find(({ departmentId }) => departmentId === score.departmentId)?.rank;
  const recordedAt = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(score.createdAt));

  return (
    <div className="site-shell score-detail-page">
      <Link href="/ranking" className="score-detail-back">← 전체 순위</Link>
      <header className={`score-detail-hero accent-${game.accent}`}>
        <div>
          <h1>{score.nickname}</h1>
          <p>{department.name} · {game.name}</p>
        </div>
        <div className="score-detail-score">
          <span>점수</span>
          <strong>{score.score}</strong>
          <small>점</small>
        </div>
      </header>
      <section className="score-detail-stats" aria-label="기록 순위">
        <div><span>전체 개인 순위</span><strong>{overallRank}위</strong></div>
        <div><span>게임 내 순위</span><strong>{gameRank}위</strong></div>
        <div><span>학과 종합 순위</span><strong>{departmentRank}위</strong></div>
        <div><span>기록 시각</span><strong className="score-detail-date">{recordedAt}</strong></div>
      </section>
      <div className="score-detail-actions">
        <PressableLink href={`/games/${game.slug}`} className="pressable-yellow">{game.name} 순위 보기</PressableLink>
        <PressableLink href={`/departments/${department.id}`} className="pressable-cream">{department.name} 기록 보기</PressableLink>
      </div>
    </div>
  );
}
