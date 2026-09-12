import type { Game } from "@/lib/types";

export const games: Game[] = [
  {
    id: "parking",
    slug: "parking",
    code: "GAME 01",
    deviceId: "GAME_01",
    emoji: "🚗",
    name: "주차왕 대작전",
    description: "차량을 정확한 자리에 멈춰 세우는 주차 챌린지",
    rankingMode: "team",
    accent: "yellow",
    maxScore: 9999,
    isActive: true,
  },
  {
    id: "star",
    slug: "star",
    code: "GAME 02",
    deviceId: "GAME_02",
    emoji: "⭐",
    name: "별별 협동작전",
    description: "별을 세며 집중력을 겨루는 카운팅 게임",
    rankingMode: "team",
    accent: "pink",
    maxScore: 9999,
    isActive: true,
  },
  {
    id: "rope",
    slug: "rope",
    code: "GAME 03",
    deviceId: "GAME_03",
    emoji: "🏃",
    name: "줄넘기 챌린지",
    description: "호흡을 맞춰 기록을 이어가는 줄넘기",
    rankingMode: "team",
    accent: "sky",
    maxScore: 9999,
    isActive: true,
  },
  {
    id: "memory",
    slug: "memory",
    code: "GAME 04",
    deviceId: "GAME_04",
    emoji: "🚦",
    name: "신호등 암기",
    description: "순간 판단력을 겨루는 두뇌 게임",
    rankingMode: "individual",
    accent: "mint",
    maxScore: 9999,
    isActive: true,
  },
  {
    id: "jump",
    slug: "jump",
    code: "GAME 05",
    deviceId: "GAME_05",
    emoji: "🕹️",
    name: "직선점프",
    description: "타이밍에 맞춰 장애물을 뛰어넘는 점프 게임",
    rankingMode: "individual",
    accent: "orange",
    maxScore: 9999,
    isActive: true,
  },
];

const legacyGameIdMap: Record<string, string> = {
  flappy: "parking",
  reaction: "star",
  "dino-run": "rope",
  timing: "memory",
  rhythm: "jump",
};

export function getGame(idOrDevice: string) {
  const normalized = idOrDevice.toUpperCase();
  const canonicalId = legacyGameIdMap[idOrDevice] ?? idOrDevice;
  return games.find(
    (game) =>
      game.id === canonicalId ||
      game.slug === canonicalId ||
      game.deviceId === normalized,
  );
}
