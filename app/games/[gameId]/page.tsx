import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DepartmentRanking } from "@/components/ranking/DepartmentRanking";
import { PlayerRanking } from "@/components/ranking/PlayerRanking";
import { PressableLink } from "@/components/ui/PressableLink";
import { RetroCard } from "@/components/ui/RetroCard";
import { games, getGame } from "@/data/games";
import { getAllScores } from "@/lib/mock-store";
import { getDepartmentStandings, getPlayerStandings } from "@/lib/ranking";

export function generateStaticParams() { return games.map((game) => ({ gameId: game.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ gameId: string }> }): Promise<Metadata> { const game = getGame((await params).gameId); return { title: game?.name ?? "게임" }; }

export default async function GameDetailPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const game = getGame(gameId);
  if (!game) notFound();

  const gameScores = getAllScores().filter((score) => score.gameId === game.id);
  const departmentStandings = getDepartmentStandings(gameScores);
  const playerStandings = getPlayerStandings(gameScores);
  const top = playerStandings[0];

  return (
    <div className="site-shell game-detail-page">
      <PressableLink href="/#game-rankings" className="pressable-cream game-detail-back">← 게임별 순위</PressableLink>
      <header className={`game-detail-hero accent-${game.accent}${top ? "" : " no-high-score"}`}>
        <div>
          <h1>{game.name}</h1>
          <p>{game.description}</p>
        </div>
        {top && (
          <div className="game-high-score">
            <span>오늘 최고 점수</span>
            <strong>{top.score}</strong>
            <small>{top.nickname}<br />{top.departmentName}</small>
          </div>
        )}
      </header>
      {gameScores.length > 0 && (
        <div className="game-detail-ranking-grid">
          <section className="section-block game-ranking-section">
            <div className="section-heading"><h2>학과 순위</h2></div>
            <RetroCard className="game-ranking-card">
              <DepartmentRanking standings={departmentStandings} limit={departmentStandings.length} />
            </RetroCard>
          </section>
          <section className="section-block game-ranking-section">
            <div className="section-heading"><h2>개인 순위</h2></div>
            <RetroCard className="game-ranking-card">
              <PlayerRanking standings={playerStandings} />
            </RetroCard>
          </section>
        </div>
      )}
    </div>
  );
}
