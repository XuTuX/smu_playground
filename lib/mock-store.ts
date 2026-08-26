import "server-only";

import { getDepartmentStandings, getPlayerStandings } from "@/lib/ranking";
import type {
  GameSession,
  RegistrationResult,
  ScoreRecord,
} from "@/lib/types";

type StoredScoreRecord = ScoreRecord & { studentId?: string };

type MockStore = {
  sessions: GameSession[];
  scores: StoredScoreRecord[];
};

declare global {
  var __smuPlaygroundStore: MockStore | undefined;
}

function getStore(): MockStore {
  if (!globalThis.__smuPlaygroundStore) {
    globalThis.__smuPlaygroundStore = { sessions: [], scores: [] };
  }
  return globalThis.__smuPlaygroundStore;
}

function toPublicScore(score: StoredScoreRecord): ScoreRecord {
  return {
    id: score.id,
    sessionId: score.sessionId,
    gameId: score.gameId,
    departmentId: score.departmentId,
    nickname: score.nickname,
    score: score.score,
    createdAt: score.createdAt,
  };
}

export function getAllScores() {
  return getStore().scores.map(toPublicScore);
}

export function createGameSession(input: {
  deviceId: string;
  gameId: string;
  score: number;
  eventId?: string | null;
}) {
  if (input.eventId) {
    const existing = getStore().sessions.find(
      (session) =>
        session.deviceId === input.deviceId && session.eventId === input.eventId,
    );
    if (existing) return existing;
  }
  const session: GameSession = {
    id: crypto.randomUUID(),
    eventId: input.eventId ?? null,
    deviceId: input.deviceId,
    gameId: input.gameId,
    score: input.score,
    status: "pending",
    createdAt: new Date().toISOString(),
    claimedAt: null,
  };
  getStore().sessions.push(session);
  return session;
}

export function getPendingGameSession(deviceId: string) {
  const normalized = deviceId.toUpperCase();
  return getStore().sessions
    .filter(
      (session) =>
        session.deviceId === normalized && session.status === "pending",
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0] ?? null;
}

export function registerGameSession(input: {
  sessionId: string;
  departmentId: string;
  nickname: string;
}): RegistrationResult | null {
  const store = getStore();
  const session = store.sessions.find(({ id }) => id === input.sessionId);

  // No await occurs before this mutation: duplicate requests cannot both claim it.
  if (!session || session.status !== "pending") return null;
  session.status = "registered";
  session.claimedAt = new Date().toISOString();

  const score: ScoreRecord = {
    id: crypto.randomUUID(),
    sessionId: session.id,
    gameId: session.gameId,
    departmentId: input.departmentId,
    nickname: input.nickname,
    score: session.score,
    createdAt: session.claimedAt,
  };
  store.scores.push(score);

  const allScores = getAllScores();
  const playerRank =
    getPlayerStandings(allScores, { gameId: score.gameId }).find(
      ({ id }) => id === score.id,
    )?.rank ?? 1;
  const departmentRank =
    getDepartmentStandings(allScores).find(
      ({ departmentId }) => departmentId === score.departmentId,
    )?.rank ?? 1;

  return {
    scoreId: score.id,
    nickname: score.nickname,
    departmentName:
      getPlayerStandings([score], { limit: 1 })[0]?.departmentName ?? "학과",
    gameCode: getPlayerStandings([score], { limit: 1 })[0]?.gameCode ?? "GAME",
    score: score.score,
    playerRank,
    departmentRank,
  };
}

export function createManualScore(input: {
  deviceId: string;
  gameId: string;
  studentId: string;
  departmentId: string;
  nickname: string;
  score: number;
}) {
  const store = getStore();
  const sessionId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  store.sessions.push({
    id: sessionId,
    eventId: `admin-${crypto.randomUUID()}`,
    deviceId: input.deviceId,
    gameId: input.gameId,
    score: input.score,
    status: "registered",
    createdAt,
    claimedAt: createdAt,
  });

  const existing = store.scores.find(
    (score) => score.studentId === input.studentId && score.gameId === input.gameId,
  );

  if (existing) {
    if (input.score <= existing.score) {
      return { status: "kept" as const, previousScore: existing.score, score: toPublicScore(existing) };
    }

    const previousScore = existing.score;
    existing.sessionId = sessionId;
    existing.departmentId = input.departmentId;
    existing.nickname = input.nickname;
    existing.score = input.score;
    existing.createdAt = createdAt;
    return { status: "updated" as const, previousScore, score: toPublicScore(existing) };
  }

  const score: StoredScoreRecord = {
    id: crypto.randomUUID(),
    sessionId,
    gameId: input.gameId,
    studentId: input.studentId,
    departmentId: input.departmentId,
    nickname: input.nickname,
    score: input.score,
    createdAt,
  };
  store.scores.push(score);
  return { status: "created" as const, previousScore: null, score: toPublicScore(score) };
}

export function getRecentSessions(limit = 20) {
  return [...getStore().sessions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function expireGameSession(sessionId: string) {
  const session = getStore().sessions.find(({ id }) => id === sessionId);
  if (!session || session.status !== "pending") return false;
  session.status = "expired";
  return true;
}

export function resetEventData() {
  globalThis.__smuPlaygroundStore = { sessions: [], scores: [] };
}
