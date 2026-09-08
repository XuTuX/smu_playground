import { PressableLink } from "@/components/ui/PressableLink";
import { RetroCard } from "@/components/ui/RetroCard";
import type { Game } from "@/lib/types";

export function GameCard({ game, highScore }: { game: Game; highScore: number }) {
  return (
    <RetroCard accent={game.accent} interactive className="game-card">
      <div><span className="game-card-emoji" aria-hidden="true">{game.emoji}</span><h3>{game.name}</h3></div>
      {highScore > 0 && <dl className="game-card-stats single-stat"><div><dt>최고 점수</dt><dd>{highScore}</dd></div></dl>}
      <PressableLink href={`/games/${game.slug}`} className="pressable-cream pressable-full">랭킹 보기</PressableLink>
    </RetroCard>
  );
}
