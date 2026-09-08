import type { Game } from "@/lib/types";

export const games: Game[] = [
  {
    id: "flappy",
    slug: "flappy",
    code: "GAME 01",
    deviceId: "GAME_01",
    emoji: "🚌",
    name: "기사님, 거기 주차 아니에요!",
    description: "버스를 정확한 자리에 멈춰 세우는 주차 챌린지",
    accent: "yellow",
    maxScore: 9999,
    isActive: true,
  },
  {
    id: "reaction",
    slug: "reaction",
    code: "GAME 02",
    deviceId: "GAME_02",
    emoji: "🌟",
    name: "Counting Star~ 별 하나에 퍼어얼~",
    description: "별을 세며 집중력을 겨루는 카운팅 게임",
    accent: "pink",
    maxScore: 9999,
    isActive: true,
  },
  {
    id: "dino-run",
    slug: "dino-run",
    code: "GAME 03",
    deviceId: "GAME_03",
    emoji: "🪢",
    name: "줄넘기, 너만 믿는다",
    description: "호흡을 맞춰 기록을 이어가는 줄넘기",
    accent: "sky",
    maxScore: 9999,
    isActive: true,
  },
  {
    id: "timing",
    slug: "timing",
    code: "GAME 04",
    deviceId: "GAME_04",
    emoji: "🧠",
    name: "내 뇌 아직 살아있다",
    description: "순간 판단력을 겨루는 두뇌 게임",
    accent: "mint",
    maxScore: 9999,
    isActive: true,
  },
  {
    id: "rhythm",
    slug: "rhythm",
    code: "GAME 05",
    deviceId: "GAME_05",
    emoji: "🐥",
    name: "Flappy 세명: 날아라 세명!",
    description: "세 명의 병아리가 함께 날아가는 플래피 게임",
    accent: "orange",
    maxScore: 9999,
    isActive: true,
  },
];

export function getGame(idOrDevice: string) {
  const normalized = idOrDevice.toUpperCase();
  return games.find(
    (game) =>
      game.id === idOrDevice ||
      game.slug === idOrDevice ||
      game.deviceId === normalized,
  );
}
