import "server-only";

import {
  appendGoogleSheetScore,
  isGoogleSheetsEnabled,
  readGoogleSheetScoreRows,
} from "@/lib/google-sheets";
import {
  claimGameSession,
  createManualScore as createMockManualScore,
  getAllScores as getMockScores,
  recordManualSession,
  registerGameSession as registerMockGameSession,
  releaseClaimedGameSession,
  removeGameSession,
} from "@/lib/mock-store";
import { getDepartmentStandings, getPlayerStandings } from "@/lib/ranking";
import {
  mergeSheetScore,
  parseSheetScoreRows,
  type SheetRowIssue,
  type SheetScoreRecord,
} from "@/lib/sheet-score-parser";
import type { RegistrationResult, ScoreRecord } from "@/lib/types";

type SheetCache = {
  scores: SheetScoreRecord[] | null;
  issues: SheetRowIssue[];
  totalRows: number;
  lastSyncedAt: string | null;
  lastError: string | null;
  expiresAt: number;
  inFlight: Promise<ScoreSnapshot> | null;
};

export type ScoreStoreStatus = {
  mode: "mock" | "google-sheets";
  state: "mock" | "ready" | "stale";
  lastSyncedAt: string | null;
  issueCount: number;
  totalRows: number;
  error: string | null;
};

export type ScoreSnapshot = {
  scores: SheetScoreRecord[];
  status: ScoreStoreStatus;
  issues: SheetRowIssue[];
};

declare global {
  var __smuSheetScoreCache: SheetCache | undefined;
}

function getSheetCache(): SheetCache {
  globalThis.__smuSheetScoreCache ??= {
    scores: null,
    issues: [],
    totalRows: 0,
    lastSyncedAt: null,
    lastError: null,
    expiresAt: 0,
    inFlight: null,
  };
  return globalThis.__smuSheetScoreCache;
}

function getCacheDurationMs() {
  const configured = Number(process.env.GOOGLE_SHEETS_CACHE_SECONDS ?? "5");
  const seconds = Number.isFinite(configured)
    ? Math.min(60, Math.max(1, configured))
    : 5;
  return seconds * 1000;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Google Sheets 동기화에 실패했습니다.";
}

function cacheSnapshot(state: "ready" | "stale"): ScoreSnapshot {
  const cache = getSheetCache();
  return {
    scores: cache.scores ?? [],
    issues: cache.issues,
    status: {
      mode: "google-sheets",
      state,
      lastSyncedAt: cache.lastSyncedAt,
      issueCount: cache.issues.length,
      totalRows: cache.totalRows,
      error: cache.lastError,
    },
  };
}

async function synchronizeSheetScores(): Promise<ScoreSnapshot> {
  const cache = getSheetCache();
  try {
    const rows = await readGoogleSheetScoreRows();
    const parsed = parseSheetScoreRows(rows);
    if (parsed.fatal) {
      throw new Error(parsed.issues.map(({ message }) => message).join(" "));
    }
    cache.scores = parsed.scores;
    cache.issues = parsed.issues;
    cache.totalRows = parsed.totalRows;
    cache.lastSyncedAt = new Date().toISOString();
    cache.lastError = null;
    cache.expiresAt = Date.now() + getCacheDurationMs();
    return cacheSnapshot("ready");
  } catch (error) {
    cache.lastError = errorMessage(error);
    cache.expiresAt = Date.now() + getCacheDurationMs();
    if (cache.scores) return cacheSnapshot("stale");
    throw error;
  }
}

async function getGoogleSheetSnapshot(options: { force?: boolean } = {}) {
  const cache = getSheetCache();
  if (!options.force && cache.scores && cache.expiresAt > Date.now()) {
    return cacheSnapshot(cache.lastError ? "stale" : "ready");
  }
  if (cache.inFlight) return cache.inFlight;

  cache.inFlight = synchronizeSheetScores();
  try {
    return await cache.inFlight;
  } finally {
    cache.inFlight = null;
  }
}

function publicScore(score: SheetScoreRecord): ScoreRecord {
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

function updateCacheAfterAppend(score: SheetScoreRecord) {
  const cache = getSheetCache();
  cache.scores = mergeSheetScore(cache.scores ?? [], score);
  cache.totalRows += 1;
  cache.lastSyncedAt = new Date().toISOString();
  cache.lastError = null;
  cache.expiresAt = Date.now() + getCacheDurationMs();
}

export async function getScoreSnapshot(): Promise<ScoreSnapshot> {
  if (isGoogleSheetsEnabled()) return getGoogleSheetSnapshot();

  const scores = getMockScores().map<SheetScoreRecord>((score) => ({
    ...score,
    studentId: null,
    source: "sheet",
  }));
  return {
    scores,
    issues: [],
    status: {
      mode: "mock",
      state: "mock",
      lastSyncedAt: null,
      issueCount: 0,
      totalRows: scores.length,
      error: null,
    },
  };
}

export async function getAllScores() {
  const snapshot = await getScoreSnapshot();
  return snapshot.scores.map(publicScore);
}

export async function createManualScore(input: {
  deviceId: string;
  gameId: string;
  studentId: string;
  departmentId: string;
  nickname: string;
  score: number;
}) {
  if (!isGoogleSheetsEnabled()) return createMockManualScore(input);

  const snapshot = await getGoogleSheetSnapshot();
  const existing = snapshot.scores.find(
    (score) =>
      score.studentId === input.studentId && score.gameId === input.gameId,
  );
  const session = recordManualSession(input);
  const score: SheetScoreRecord = {
    id: crypto.randomUUID(),
    sessionId: session.id,
    studentId: input.studentId,
    gameId: input.gameId,
    departmentId: input.departmentId,
    nickname: input.nickname,
    score: input.score,
    createdAt: session.createdAt,
    source: "admin",
  };

  try {
    await appendGoogleSheetScore(score);
    updateCacheAfterAppend(score);
  } catch (error) {
    removeGameSession(session.id);
    throw error;
  }

  if (existing && input.score <= existing.score) {
    return {
      status: "kept" as const,
      previousScore: existing.score,
      score: publicScore(existing),
    };
  }

  return {
    status: existing ? ("updated" as const) : ("created" as const),
    previousScore: existing?.score ?? null,
    score: publicScore(score),
  };
}

function registrationResult(
  score: ScoreRecord,
  allScores: ScoreRecord[],
): RegistrationResult {
  const player = getPlayerStandings([score], { limit: 1 })[0];
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
    departmentName: player?.departmentName ?? "학과",
    gameCode: player?.gameCode ?? "GAME",
    score: score.score,
    playerRank,
    departmentRank,
  };
}

export async function registerGameSession(input: {
  sessionId: string;
  departmentId: string;
  nickname: string;
}) {
  if (!isGoogleSheetsEnabled()) return registerMockGameSession(input);

  const session = claimGameSession(input.sessionId);
  if (!session) return null;

  const score: SheetScoreRecord = {
    id: crypto.randomUUID(),
    sessionId: session.id,
    studentId: null,
    gameId: session.gameId,
    departmentId: input.departmentId,
    nickname: input.nickname,
    score: session.score,
    createdAt: session.claimedAt ?? new Date().toISOString(),
    source: "esp32",
  };

  try {
    const snapshot = await getGoogleSheetSnapshot();
    await appendGoogleSheetScore(score);
    updateCacheAfterAppend(score);
    const allScores = mergeSheetScore(snapshot.scores, score).map(publicScore);
    return registrationResult(publicScore(score), allScores);
  } catch (error) {
    releaseClaimedGameSession(session.id);
    throw error;
  }
}
