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

type StoredScoreRecord = ScoreRecord & {
  participantPhone?: string;
  teamName?: string | null;
};

type MockStudent = {
  id: string;
  phoneNumber: string;
  nickname: string;
  departmentId: string;
};

type MockStore = {
  seedVersion: number;
  sessions: GameSession[];
  scores: StoredScoreRecord[];
  students: MockStudent[];
};

const MOCK_SEED_VERSION = 5;

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
        playerId:
          getGame(score.gameId)?.rankingMode === "team"
            ? `mock-team-010${String(10000000 + index).slice(-8)}`
            : `mock-participant-010${String(10000000 + index).slice(-8)}`,
        participantPhone: `010${String(10000000 + index).slice(-8)}`,
        teamName: getGame(score.gameId)?.rankingMode === "team" ? score.nickname : null,
      })),
      students: mockScores.flatMap((score, index) =>
        getGame(score.gameId)?.rankingMode === "individual"
          ? [{
              id: `mock-participant-010${String(10000000 + index).slice(-8)}`,
              phoneNumber: `010${String(10000000 + index).slice(-8)}`,
              nickname: score.nickname,
              departmentId: score.departmentId,
            }]
          : [],
      ),
    };
  }
  return globalThis.__smuPlaygroundStore;
}

function toPublicScore(score: StoredScoreRecord): ScoreRecord {
  const phone = score.participantPhone ?? null;
  return {
    id: score.id,
    sessionId: score.sessionId,
    playerId: phone ? `phone:${phone}` : score.playerId,
    participantPhone: phone,
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
    .map((score) => {
      const isTeam = getGame(score.gameId)?.rankingMode === "team";
      const student = store.students.find(({ id }) => id === score.playerId);
      return {
        ...toPublicScore(score),
        participantKind: isTeam ? ("team" as const) : ("individual" as const),
        participantPhone: student?.phoneNumber ?? score.participantPhone ?? null,
        teamName: score.teamName ?? (isTeam ? score.nickname : null),
      };
    });
}

export function getParticipantProfile(
  phone: string,
  participantKind?: "individual" | "team" | null,
) {
  const store = getStore();

  const teamScore = store.scores
    .filter((s) => s.participantPhone === phone && getGame(s.gameId)?.rankingMode === "team")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  const student = store.students.find(({ phoneNumber }) => phoneNumber === phone);
  const indScore = store.scores
    .filter((s) => s.participantPhone === phone && getGame(s.gameId)?.rankingMode !== "team")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  if (participantKind === "team") {
    if (teamScore) {
      return {
        displayName: teamScore.teamName ?? teamScore.nickname,
        departmentId: teamScore.departmentId,
      };
    }
    if (student) {
      return {
        displayName: student.nickname,
        departmentId: student.departmentId,
      };
    }
    if (indScore) {
      return {
        displayName: indScore.nickname,
        departmentId: indScore.departmentId,
      };
    }
    return null;
  }

  if (student) {
    return { displayName: student.nickname, departmentId: student.departmentId };
  }
  if (indScore) {
    return { displayName: indScore.nickname, departmentId: indScore.departmentId };
  }
  if (teamScore) {
    return {
      displayName: teamScore.teamName ?? teamScore.nickname,
      departmentId: teamScore.departmentId,
    };
  }
  return null;
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
  phone: string;
  departmentId: string;
  nickname: string;
  teamName?: string | null;
  score: number;
}) {
  const store = getStore();
  const session = recordManualSession(input);
  const sessionId = session.id;
  const createdAt = session.createdAt;
  const isTeam = getGame(input.gameId)?.rankingMode === "team";
  const participantName = (input.teamName ?? input.nickname).trim();

  // Synchronize department and display name across all existing scores with this phone
  for (const s of store.scores) {
    if (s.participantPhone === input.phone) {
      s.departmentId = input.departmentId;
      s.nickname = participantName;
      if (input.teamName) {
        s.teamName = input.teamName;
      }
    }
  }

  if (isTeam) {
    const teamPlayerId = `mock-team-${input.phone}`;
    const existing = store.scores.find(
      (score) =>
        (score.participantPhone === input.phone || score.playerId === teamPlayerId) &&
        score.gameId === input.gameId,
    );

    if (existing) {
      const previousScore = existing.score;
      existing.departmentId = input.departmentId;
      existing.teamName = input.teamName;
      existing.nickname = participantName;
      existing.participantPhone = input.phone;
      if (input.score > existing.score) {
        existing.sessionId = sessionId;
        existing.score = input.score;
        existing.createdAt = createdAt;
        return { status: "updated" as const, previousScore, score: toPublicScore(existing) };
      }
      return { status: "kept" as const, previousScore, score: toPublicScore(existing) };
    }

    const teamScore: StoredScoreRecord = {
      id: crypto.randomUUID(),
      sessionId,
      playerId: teamPlayerId,
      gameId: input.gameId,
      departmentId: input.departmentId,
      nickname: participantName,
      teamName: input.teamName,
      participantPhone: input.phone,
      score: input.score,
      createdAt,
    };
    store.scores.push(teamScore);
    return { status: "created" as const, previousScore: null, score: toPublicScore(teamScore) };
  }

  let student = store.students.find(
    ({ phoneNumber }) => phoneNumber === input.phone,
  );

  if (!student) {
    student = {
      id: crypto.randomUUID(),
      phoneNumber: input.phone,
      departmentId: input.departmentId,
      nickname: input.nickname,
    };
    store.students.push(student);
  } else {
    student.departmentId = input.departmentId;
    student.nickname = input.nickname;
  }

  const existing = store.scores.find(
    (score) =>
      (score.participantPhone === input.phone || score.playerId === student.id) &&
      score.gameId === input.gameId,
  );

  if (existing) {
    const previousScore = existing.score;
    existing.departmentId = input.departmentId;
    existing.nickname = input.nickname;
    if (input.score <= existing.score) {
      return { status: "kept" as const, previousScore, score: toPublicScore(existing) };
    }

    existing.sessionId = sessionId;
    existing.score = input.score;
    existing.createdAt = createdAt;
    return { status: "updated" as const, previousScore, score: toPublicScore(existing) };
  }

  const score: StoredScoreRecord = {
    id: crypto.randomUUID(),
    sessionId,
    playerId: student.id,
    gameId: input.gameId,
    participantPhone: input.phone,
    departmentId: input.departmentId,
    nickname: input.nickname,
    teamName: null,
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

  const phone = score.participantPhone;
  if (phone) {
    for (const s of store.scores) {
      if (s.participantPhone === phone) {
        s.departmentId = input.departmentId;
        s.nickname = input.nickname;
        if (s.teamName !== null && s.teamName !== undefined) {
          s.teamName = input.nickname;
        }
      }
    }
    const student = store.students.find(({ phoneNumber }) => phoneNumber === phone);
    if (student) {
      student.departmentId = input.departmentId;
      student.nickname = input.nickname;
    }
  } else {
    score.departmentId = input.departmentId;
    score.nickname = input.nickname;
    if (score.teamName) score.teamName = input.nickname;
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
