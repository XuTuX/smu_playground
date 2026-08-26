import type { Game } from "@/lib/types";

export const games: Game[] = [
  {
    id: "flappy",
    slug: "flappy",
    name: "1D FLAPPY",
    description: "버튼으로 장애물을 피해 최대한 오래 살아남기",
    accent: "yellow",
    maxScore: 999,
    isActive: true,
  },
  {
    id: "reaction",
    slug: "reaction",
    name: "REACTION",
    description: "LED 신호가 나타나면 누구보다 빠르게 버튼 누르기",
    accent: "pink",
    maxScore: 999,
    isActive: true,
  },
  {
    id: "dino-run",
    slug: "dino-run",
    name: "DINO RUN",
    description: "다가오는 장애물을 타이밍에 맞춰 점프하기",
    accent: "sky",
    maxScore: 999,
    isActive: true,
  },
  {
    id: "timing",
    slug: "timing",
    name: "TIMING",
    description: "움직이는 LED를 목표 지점에 정확히 멈추기",
    accent: "mint",
    maxScore: 999,
    isActive: true,
  },
  {
    id: "rhythm",
    slug: "rhythm",
    name: "RHYTHM",
    description: "LED 리듬에 맞춰 정확하게 버튼 입력하기",
    accent: "orange",
    maxScore: 999,
    isActive: true,
  },
];

export function getGame(idOrDevice: string) {
  return games.find(
    (game) =>
      game.id === idOrDevice ||
      game.slug === idOrDevice,
  );
}
