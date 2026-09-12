import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DepartmentRanking } from "@/components/ranking/DepartmentRanking";
import { PlayerRanking } from "@/components/ranking/PlayerRanking";
import { RankingAutoRefresh } from "@/components/ranking/RankingAutoRefresh";
import { EmptyState } from "@/components/ui/EmptyState";
import { PressableLink } from "@/components/ui/PressableLink";
import { RetroCard } from "@/components/ui/RetroCard";
import { games, getGame } from "@/data/games";
import { getAllScores } from "@/lib/score-store";
import { getDepartmentStandings, getPlayerStandings } from "@/lib/ranking";

export function generateStaticParams() {
  return games.map((game) => ({ gameId: game.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gameId: string }>;
}): Promise<Metadata> {
  const game = getGame((await params).gameId);
  return { title: game ? `${game.name} 순위` : "게임" };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const game = getGame(gameId);
  if (!game) notFound();

  const gameScores = (await getAllScores()).filter((score) => score.gameId === game.id);
  const departmentStandings = getDepartmentStandings(gameScores);
  const playerStandings = getPlayerStandings(gameScores);
  const top = playerStandings[0];

  return (
    <div className="site-shell game-detail-page">
      <RankingAutoRefresh />
      <div className="page-back-nav">
        <PressableLink href="/?tab=game" className="pressable-cream page-back-button">
          ← 5종 게임 목록
        </PressableLink>
      </div>

      <header className={`game-detail-hero accent-${game.accent}${top ? "" : " no-high-score"}`}>
        <div>
          <span className="game-detail-emoji" aria-hidden="true">
            {game.emoji}
          </span>
          <div className="game-detail-badge-wrap">
            <span className="game-mode-tag">
              {game.rankingMode === "team" ? "👥 협동 팀전" : "👤 개인 챌린지"}
            </span>
          </div>
          <h1>{game.name}</h1>
          <p>{game.description}</p>
        </div>
        {top && (
          <div className="game-high-score">
            <span>오늘 최고 점수</span>
            <strong>{top.score.toLocaleString("ko-KR")}</strong>
            <small>
              {top.nickname}
              <br />
              {top.departmentName}
            </small>
          </div>
        )}
      </header>

      {gameScores.length > 0 ? (
        <div className="game-detail-ranking-grid">
          <section className="section-block game-ranking-section">
            <div className="section-heading">
              <h2>학과 순위</h2>
            </div>
            <RetroCard className="game-ranking-card">
              <DepartmentRanking standings={departmentStandings} limit={departmentStandings.length} />
            </RetroCard>
          </section>
          <section className="section-block game-ranking-section">
            <div className="section-heading">
              <h2>{game.rankingMode === "team" ? "팀" : "개인"} 순위</h2>
            </div>
            <RetroCard className="game-ranking-card">
              <PlayerRanking standings={playerStandings} mode={game.rankingMode} />
            </RetroCard>
          </section>
        </div>
      ) : (
        <section className="section-block">
          <RetroCard className="game-empty-card">
            <EmptyState
              title="아직 등록된 기록이 없어요!"
              description={`${game.name} 부스에 방문해서 오늘의 첫 번째 1위 기록을 세워보세요!`}
              actionText="다른 게임 순위 보기"
              actionHref="/?tab=game"
            />
          </RetroCard>
        </section>
      )}
    </div>
  );
}
