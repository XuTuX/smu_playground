import "server-only";

import { mockScores } from "@/data/mock";
import { getGame } from "@/data/games";
import { getDepartmentStandings, getPlayerStandings } from "@/lib/ranking";
import type {
  AdminScoreRecord,
  GameSession,
  RegistrationResult,
  ScoreRecord,
} from "@/lib/types";

type StoredScoreRecord = ScoreRecord & { studentId?: string; teamName?: string | null };

type MockStudent = {
  id: string;
  studentNumber: string;
  nickname: string;
  departmentId: string;
};

type MockStore = {
  seedVersion: number;
  sessions: GameSession[];
  scores: StoredScoreRecord[];
  students: MockStudent[];
};

const MOCK_SEED_VERSION = 3;

declare global {
  var __smuPlaygroundStore: MockStore | undefined;
}

function getStore(): MockStore {
  if (globalThis.__smuPlaygroundStore?.seedVersion !== MOCK_SEED_VERSION) {
    globalThis.__smuPlaygroundStore = {
      seedVersion: MOCK_SEED_VERSION,
      sessions: mockScores.map((score, index) => ({
        id: score.sessionId,
        eventId: `mock-event-${String(index + 1).padStart(3, "0")}`,
        deviceId: `MOCK_${String((index % 5) + 1).padStart(2, "0")}`,
        gameId: score.gameId,
        score: score.score,
        status: "registered",
        createdAt: score.createdAt,
        claimedAt: score.createdAt,
      })),
      scores: mockScores.map((score, index) => ({
        ...score,
        playerId: `mock-student-${index + 1}`,
        studentId: String(900001 + index),
      })),
      students: mockScores.map((score, index) => ({
        id: `mock-student-${index + 1}`,
        studentNumber: String(900001 + index),
        nickname: score.nickname,
        departmentId: score.departmentId,
      })),
    };
  }
  return globalThis.__smuPlaygroundStore;
}

function toPublicScore(score: StoredScoreRecord): ScoreRecord {
  return {
    id: score.id,
    sessionId: score.sessionId,
    playerId: score.playerId,
    gameId: score.gameId,
    departmentId: score.departmentId,
    nickname: score.nickname,
    score: score.score,
    createdAt: score.createdAt,
    teamName: score.teamName ?? null,
  };
}

export function getAllScores() {
  return getStore().scores.map(toPublicScore);
}

export function getAdminScoreRecords(): AdminScoreRecord[] {
  const store = getStore();
  return [...store.scores]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((score) => ({
      ...toPublicScore(score),
      studentNumber:
        store.students.find(({ id }) => id === score.playerId)?.studentNumber ??
        score.studentId ??
        "-",
      studentNickname:
        store.students.find(({ id }) => id === score.playerId)?.nickname ?? score.nickname,
      teamName: score.teamName ?? null,
    }));
}

export function getStudentProfile(studentId: string) {
  const student = getStore().students.find(
    ({ studentNumber }) => studentNumber === studentId,
  );
  if (!student) return null;
  return { nickname: student.nickname, departmentId: student.departmentId };
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

export function claimGameSession(sessionId: string) {
  const session = getStore().sessions.find(({ id }) => id === sessionId);
  if (!session || session.status !== "pending") return null;
  session.status = "registered";
  session.claimedAt = new Date().toISOString();
  return { ...session };
}

export function releaseClaimedGameSession(sessionId: string) {
  const session = getStore().sessions.find(({ id }) => id === sessionId);
  if (!session || session.status !== "registered") return false;
  session.status = "pending";
  session.claimedAt = null;
  return true;
}

export function removeGameSession(sessionId: string) {
  const store = getStore();
  const index = store.sessions.findIndex(({ id }) => id === sessionId);
  if (index < 0) return false;
  store.sessions.splice(index, 1);
  return true;
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
  teamName?: string | null;
  score: number;
}) {
  const store = getStore();
  const session = recordManualSession(input);
  const sessionId = session.id;
  const createdAt = session.createdAt;
  let student = store.students.find(
    ({ studentNumber }) => studentNumber === input.studentId,
  );

  if (!student) {
    student = {
      id: crypto.randomUUID(),
      studentNumber: input.studentId,
      departmentId: input.departmentId,
      nickname: input.nickname,
    };
    store.students.push(student);
  }

  const existing = store.scores.find(
    (score) => score.playerId === student.id && score.gameId === input.gameId,
  );

  if (existing) {
    if (input.score <= existing.score) {
      if (input.teamName) {
        existing.teamName = input.teamName;
        existing.nickname = input.teamName;
      }
      return { status: "kept" as const, previousScore: existing.score, score: toPublicScore(existing) };
    }

    const previousScore = existing.score;
    existing.sessionId = sessionId;
    existing.departmentId = student.departmentId;
    existing.teamName = input.teamName ?? null;
    existing.nickname = input.teamName ?? student.nickname;
    existing.score = input.score;
    existing.createdAt = createdAt;
    return { status: "updated" as const, previousScore, score: toPublicScore(existing) };
  }

  const score: StoredScoreRecord = {
    id: crypto.randomUUID(),
    sessionId,
    playerId: student.id,
    gameId: input.gameId,
    studentId: input.studentId,
    departmentId: student.departmentId,
    nickname: input.teamName ?? student.nickname,
    teamName: input.teamName ?? null,
    score: input.score,
    createdAt,
  };
  store.scores.push(score);
  return { status: "created" as const, previousScore: null, score: toPublicScore(score) };
}

export function updateAdminScore(
  scoreId: string,
  input: { departmentId: string; nickname: string; score: number },
) {
  const store = getStore();
  const score = store.scores.find(({ id }) => id === scoreId);
  if (!score) return null;

  const student = store.students.find(({ id }) => id === score.playerId);
  if (!student) return null;

  const isTeam = getGame(score.gameId)?.rankingMode === "team";
  student.departmentId = input.departmentId;
  if (!isTeam) student.nickname = input.nickname;
  for (const studentScore of store.scores) {
    if (studentScore.playerId === student.id) {
      studentScore.departmentId = input.departmentId;
      if (!getGame(studentScore.gameId) || getGame(studentScore.gameId)?.rankingMode !== "team") {
        studentScore.nickname = student.nickname;
      }
    }
  }
  if (isTeam) {
    score.teamName = input.nickname;
    score.nickname = input.nickname;
  }
  score.score = input.score;
  score.createdAt = new Date().toISOString();

  return getAdminScoreRecords().find(({ id }) => id === scoreId) ?? null;
}

export function deleteAdminScore(scoreId: string) {
  const store = getStore();
  const index = store.scores.findIndex(({ id }) => id === scoreId);
  if (index < 0) return false;
  store.scores.splice(index, 1);
  return true;
}

export function recordManualSession(input: {
  deviceId: string;
  gameId: string;
  score: number;
}) {
  const createdAt = new Date().toISOString();
  const session: GameSession = {
    id: crypto.randomUUID(),
    eventId: `admin-${crypto.randomUUID()}`,
    deviceId: input.deviceId,
    gameId: input.gameId,
    score: input.score,
    status: "registered",
    createdAt,
    claimedAt: createdAt,
  };
  getStore().sessions.push(session);
  return session;
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
  globalThis.__smuPlaygroundStore = {
    seedVersion: MOCK_SEED_VERSION,
    sessions: [],
    scores: [],
    students: [],
  };
}
