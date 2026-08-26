import { departments } from "@/data/departments";
import { games } from "@/data/games";
import type { ScoreRecord } from "@/lib/types";

const nicknames = [
  "LED신",
  "ESP왕",
  "버튼고수",
  "반응속도99",
  "점프장인",
  "축제새내기",
  "불꽃손가락",
  "오늘은내가",
  "아케이드캣",
  "세명대짱",
  "리듬천재",
  "초록버튼",
];

const featuredDepartments = [
  "ai-computer",
  "nursing",
  "advertising-pr",
  "smart-it",
  "electrical-electronics",
  "police",
  "hotel-management",
  "social-welfare",
  "fire-disaster",
  "sports-leisure",
  "visual-video-design",
  "animal-health",
];

export const mockScores: ScoreRecord[] = Array.from({ length: 96 }, (_, index) => {
  const game = games[index % games.length];
  const departmentId = featuredDepartments[(index * 5 + Math.floor(index / 7)) % featuredDepartments.length];
  const score = 18 + ((index * 17 + (index % 5) * 11) % 52);
  const createdAt = new Date(
    Date.UTC(2026, 7, 25, 5, 30) - index * 73_000,
  ).toISOString();

  return {
    id: `mock-score-${index + 1}`,
    sessionId: `mock-session-${index + 1}`,
    gameId: game.id,
    departmentId,
    nickname: nicknames[index % nicknames.length],
    score,
    createdAt,
  };
});

// Keep the first screen immediately legible and recognizably SMU.
mockScores.push(
  {
    id: "featured-1",
    sessionId: "featured-session-1",
    gameId: "flappy",
    departmentId: "ai-computer",
    nickname: "LED신",
    score: 84,
    createdAt: "2026-08-25T06:10:00.000Z",
  },
  {
    id: "featured-2",
    sessionId: "featured-session-2",
    gameId: "reaction",
    departmentId: "nursing",
    nickname: "speed99",
    score: 79,
    createdAt: "2026-08-25T06:09:52.000Z",
  },
  {
    id: "featured-3",
    sessionId: "featured-session-3",
    gameId: "rhythm",
    departmentId: "advertising-pr",
    nickname: "홍보요정",
    score: 76,
    createdAt: "2026-08-25T06:09:41.000Z",
  },
);

export const activeDepartmentIds = new Set(
  departments.filter((department) => department.isActive).map(({ id }) => id),
);
