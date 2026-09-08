import { getDepartment } from "@/data/departments";
import { getGame } from "@/data/games";
import type { ScoreRecord } from "@/lib/types";

export type SheetScoreSource = "sheet" | "admin" | "esp32";

export type SheetScoreRecord = ScoreRecord & {
  studentId: string | null;
  source: SheetScoreSource;
};

export type SheetRowIssue = {
  rowNumber: number;
  field: string;
  message: string;
};

export type SheetScoreParseResult = {
  scores: SheetScoreRecord[];
  issues: SheetRowIssue[];
  totalRows: number;
  fatal: boolean;
};

const REQUIRED_HEADERS = [
  "record_id",
  "game_id",
  "department_id",
  "nickname",
  "score",
  "created_at",
  "active",
] as const;

function cellText(value: unknown) {
  return value == null ? "" : String(value).trim();
}

function isActiveValue(value: unknown) {
  if (value === true) return true;
  const normalized = cellText(value).toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function isInactiveValue(value: unknown) {
  if (value === false) return true;
  const normalized = cellText(value).toLowerCase();
  return normalized === "false" || normalized === "0" || normalized === "no";
}

function isBlankRow(row: unknown[]) {
  return row.every((value) => cellText(value) === "");
}

function getValue(
  row: unknown[],
  headers: Map<string, number>,
  field: string,
) {
  const index = headers.get(field);
  return index == null ? undefined : row[index];
}

function pickBestStudentScores(scores: SheetScoreRecord[]) {
  const withoutStudentId: SheetScoreRecord[] = [];
  const bestByStudentAndGame = new Map<string, SheetScoreRecord>();

  for (const score of scores) {
    if (!score.studentId) {
      withoutStudentId.push(score);
      continue;
    }

    const key = `${score.studentId}:${score.gameId}`;
    const current = bestByStudentAndGame.get(key);
    if (
      !current ||
      score.score > current.score ||
      (score.score === current.score && score.createdAt < current.createdAt)
    ) {
      bestByStudentAndGame.set(key, score);
    }
  }

  return [...withoutStudentId, ...bestByStudentAndGame.values()].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
}

export function mergeSheetScore(
  scores: SheetScoreRecord[],
  appended: SheetScoreRecord,
) {
  return pickBestStudentScores([
    ...scores.filter(
      (score) =>
        score.id !== appended.id && score.sessionId !== appended.sessionId,
    ),
    appended,
  ]);
}

export function parseSheetScoreRows(rows: unknown[][]): SheetScoreParseResult {
  const issues: SheetRowIssue[] = [];
  if (rows.length === 0) {
    return {
      scores: [],
      issues: [{ rowNumber: 1, field: "header", message: "헤더 행이 없습니다." }],
      totalRows: 0,
      fatal: true,
    };
  }

  const headers = new Map(
    rows[0].map((value, index) => [cellText(value).toLowerCase(), index]),
  );
  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headers.has(header),
  );
  if (missingHeaders.length > 0) {
    return {
      scores: [],
      issues: missingHeaders.map((field) => ({
        rowNumber: 1,
        field,
        message: `필수 헤더 ${field}가 없습니다.`,
      })),
      totalRows: Math.max(0, rows.length - 1),
      fatal: true,
    };
  }

  const parsed: SheetScoreRecord[] = [];
  const seenRecordIds = new Set<string>();
  const seenSessionIds = new Set<string>();

  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    if (isBlankRow(row)) return;

    const recordId = cellText(getValue(row, headers, "record_id"));
    const sessionId = cellText(getValue(row, headers, "session_id"));
    const studentId = cellText(getValue(row, headers, "student_id"));
    const gameId = cellText(getValue(row, headers, "game_id"));
    const departmentId = cellText(getValue(row, headers, "department_id"));
    const nickname = cellText(getValue(row, headers, "nickname"));
    const rawScore = getValue(row, headers, "score");
    const rawCreatedAt = getValue(row, headers, "created_at");
    const rawActive = getValue(row, headers, "active");
    const rawSource = cellText(getValue(row, headers, "source"));
    const rowIssues: SheetRowIssue[] = [];

    if (isInactiveValue(rawActive)) return;

    if (!recordId || recordId.length > 128 || /[<>\u0000-\u001f\u007f]/u.test(recordId)) {
      rowIssues.push({ rowNumber, field: "record_id", message: "record_id가 비어 있거나 형식이 올바르지 않습니다." });
    } else if (seenRecordIds.has(recordId)) {
      rowIssues.push({ rowNumber, field: "record_id", message: "중복 record_id입니다." });
    }

    if (sessionId && sessionId.length > 128) {
      rowIssues.push({ rowNumber, field: "session_id", message: "session_id는 128자 이하여야 합니다." });
    } else if (sessionId && seenSessionIds.has(sessionId)) {
      rowIssues.push({ rowNumber, field: "session_id", message: "중복 session_id입니다." });
    }

    if (studentId && !/^\d{6,12}$/.test(studentId)) {
      rowIssues.push({ rowNumber, field: "student_id", message: "학번은 숫자 6~12자리여야 합니다." });
    }

    const game = getGame(gameId);
    if (!game?.isActive) {
      rowIssues.push({ rowNumber, field: "game_id", message: "활성 게임 ID가 아닙니다." });
    }

    const department = getDepartment(departmentId);
    if (!department?.isActive) {
      rowIssues.push({ rowNumber, field: "department_id", message: "활성 학과 ID가 아닙니다." });
    }

    if (
      nickname.length < 2 ||
      nickname.length > 12 ||
      /[<>\u0000-\u001f\u007f]/u.test(nickname)
    ) {
      rowIssues.push({ rowNumber, field: "nickname", message: "닉네임은 사용할 수 있는 문자로 2~12자여야 합니다." });
    }

    const score = typeof rawScore === "number" ? rawScore : Number(cellText(rawScore));
    if (!game || !Number.isSafeInteger(score) || score < 0 || score > game.maxScore) {
      rowIssues.push({ rowNumber, field: "score", message: `점수는 0~${game?.maxScore ?? 999} 정수여야 합니다.` });
    }

    const createdAtText = cellText(rawCreatedAt);
    const createdAtTimestamp = Date.parse(createdAtText);
    if (!createdAtText || Number.isNaN(createdAtTimestamp)) {
      rowIssues.push({ rowNumber, field: "created_at", message: "created_at은 ISO 8601 날짜여야 합니다." });
    }

    if (!isActiveValue(rawActive)) {
      rowIssues.push({ rowNumber, field: "active", message: "active는 TRUE 또는 FALSE여야 합니다." });
    }

    const source: SheetScoreSource =
      rawSource === "admin" || rawSource === "esp32" || rawSource === "sheet"
        ? rawSource
        : "sheet";

    if (rowIssues.length > 0) {
      issues.push(...rowIssues);
      return;
    }

    seenRecordIds.add(recordId);
    if (sessionId) seenSessionIds.add(sessionId);
    parsed.push({
      id: recordId,
      sessionId: sessionId || recordId,
      studentId: studentId || null,
      gameId,
      departmentId,
      nickname,
      score,
      createdAt: new Date(createdAtTimestamp).toISOString(),
      source,
    });
  });

  return {
    scores: pickBestStudentScores(parsed),
    issues,
    totalRows: rows.slice(1).filter((row) => !isBlankRow(row)).length,
    fatal: false,
  };
}
