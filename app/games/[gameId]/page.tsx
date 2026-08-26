import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PlayerRanking } from "@/components/ranking/PlayerRanking";
import { RetroCard } from "@/components/ui/RetroCard";
import { games, getGame } from "@/data/games";
import { getAllScores } from "@/lib/mock-store";
import { getPlayerStandings } from "@/lib/ranking";

export function generateStaticParams() { return games.map((game) => ({ gameId: game.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ gameId: string }> }): Promise<Metadata> { const game = getGame((await params).gameId); return { title: game?.name ?? "게임" }; }

export default async function GameDetailPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params; const game = getGame(gameId); if (!game) notFound();
  const standings = getPlayerStandings(getAllScores(), { gameId: game.id, limit: 10 }); const top = standings[0];
  return <div className="site-shell game-detail-page"><header className={`game-detail-hero accent-${game.accent}${top ? "" : " no-high-score"}`}><div><span className="game-order-label">{game.code.replace("GAME ", "게임 ")}</span><h1>{game.name}</h1><p>{game.description}</p></div>{top && <div className="game-high-score"><span>오늘 최고 점수</span><strong>{top.score}</strong><small>{top.nickname}<br />{top.departmentName}</small></div>}</header>{standings.length > 0 && <section className="section-block game-ranking-section"><div className="section-heading"><h2>오늘의 상위 10명</h2></div><RetroCard className="game-ranking-card"><PlayerRanking standings={standings} /></RetroCard></section>}</div>;
}
