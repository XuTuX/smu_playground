import type { Metadata } from "next";
import { GameCard } from "@/components/games/GameCard";
import { games } from "@/data/games";
import { getAllScores } from "@/lib/mock-store";

export const metadata: Metadata = { title: "게임" };

export default function GamesPage() {
  const scores = getAllScores();
  return <div className="site-shell"><header className="page-intro section-heading public-page-intro games-page-intro"><div><h1>게임별 순위</h1><p>게임을 선택해 최고 기록과 현재 순위를 확인하세요.</p></div></header><div className="games-grid games-page-grid">{games.map((game) => <GameCard game={game} highScore={Math.max(0, ...scores.filter((score) => score.gameId === game.id).map((score) => score.score))} key={game.id} />)}</div></div>;
}
