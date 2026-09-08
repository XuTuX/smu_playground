import "server-only";

import {
  createManualScore as createMockManualScore,
  getAllScores as getMockScores,
  getStudentProfile as getMockStudentProfile,
} from "@/lib/mock-store";
import { isSupabaseConfigured, supabaseRest } from "@/lib/supabase-rest";
import type { ScoreRecord } from "@/lib/types";

type SupabaseScoreRow = {
  id: string;
  student_id: string;
  game_id: string;
  score: number;
  updated_at: string;
  student: {
    id: string;
    nickname: string;
    department_id: string;
  };
};

type SupabaseStudentRow = {
  id: string;
  student_number: string;
  nickname: string;
  department_id: string;
};

type UpsertScoreRow = {
  result_status: "created" | "updated" | "kept";
  result_previous_score: number | null;
  result_score_id: string;
  result_student_id: string;
  result_nickname: string;
  result_department_id: string;
  result_game_id: string;
  result_score: number;
  result_updated_at: string;
};

export type ScoreStoreStatus = {
  mode: "mock" | "supabase";
  state: "mock" | "ready";
  totalRows: number;
  error: null;
};

export type ScoreSnapshot = {
  scores: ScoreRecord[];
  status: ScoreStoreStatus;
};

function publicScore(row: SupabaseScoreRow): ScoreRecord {
  return {
    id: row.id,
    sessionId: row.id,
    playerId: row.student.id,
    gameId: row.game_id,
    departmentId: row.student.department_id,
    nickname: row.student.nickname,
    score: row.score,
    createdAt: row.updated_at,
  };
}

export async function getScoreSnapshot(): Promise<ScoreSnapshot> {
  if (!isSupabaseConfigured()) {
    const scores = getMockScores();
    return {
      scores,
      status: {
        mode: "mock",
        state: "mock",
        totalRows: scores.length,
        error: null,
      },
    };
  }

  const select = [
    "id",
    "student_id",
    "game_id",
    "score",
    "updated_at",
    "student:students!scores_student_id_fkey(id,nickname,department_id)",
  ].join(",");
  const rows = await supabaseRest<SupabaseScoreRow[]>(
    `scores?select=${encodeURIComponent(select)}&order=updated_at.asc`,
  );
  const scores = rows.map(publicScore);

  return {
    scores,
    status: {
      mode: "supabase",
      state: "ready",
      totalRows: scores.length,
      error: null,
    },
  };
}

export async function getAllScores() {
  return (await getScoreSnapshot()).scores;
}

export async function getStudentProfile(studentNumber: string) {
  if (!isSupabaseConfigured()) return getMockStudentProfile(studentNumber);

  const rows = await supabaseRest<SupabaseStudentRow[]>(
    `students?select=id,student_number,nickname,department_id&student_number=eq.${encodeURIComponent(studentNumber)}&limit=1`,
  );
  const student = rows[0];
  if (!student) return null;

  return {
    nickname: student.nickname,
    departmentId: student.department_id,
  };
}

export async function createManualScore(input: {
  gameId: string;
  studentId: string;
  departmentId: string;
  nickname: string;
  score: number;
}) {
  if (!isSupabaseConfigured()) {
    return createMockManualScore({
      ...input,
      deviceId: input.gameId,
    });
  }

  const rows = await supabaseRest<UpsertScoreRow[]>("rpc/upsert_admin_score", {
    method: "POST",
    body: JSON.stringify({
      p_student_number: input.studentId,
      p_game_id: input.gameId,
      p_department_id: input.departmentId,
      p_nickname: input.nickname,
      p_score: input.score,
    }),
  });
  const row = rows[0];
  if (!row) throw new Error("점수 저장 결과를 확인할 수 없습니다.");

  return {
    status: row.result_status,
    previousScore: row.result_previous_score,
    score: {
      id: row.result_score_id,
      sessionId: row.result_score_id,
      playerId: row.result_student_id,
      gameId: row.result_game_id,
      departmentId: row.result_department_id,
      nickname: row.result_nickname,
      score: row.result_score,
      createdAt: row.result_updated_at,
    } satisfies ScoreRecord,
  };
}
