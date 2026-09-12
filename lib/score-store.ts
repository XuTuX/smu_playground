import "server-only";

import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import {
  createManualScore as createMockManualScore,
  deleteAdminScore as deleteMockAdminScore,
  getAdminScoreRecords as getMockAdminScoreRecords,
  getAllScores as getMockScores,
  getStudentProfile as getMockStudentProfile,
  updateAdminScore as updateMockAdminScore,
} from "@/lib/mock-store";
import { isSupabaseConfigured, supabaseRest } from "@/lib/supabase-rest";
import type { AdminScoreRecord, ScoreRecord } from "@/lib/types";

export async function isMockModeActive(): Promise<boolean> {
  if (!isMockModeAvailable()) return false;
  if (!isSupabaseConfigured()) return true;
  try {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get("smu_mock_data")?.value;
    if (cookieVal === "true") return true;
    if (cookieVal === "false") return false;
  } catch {
    // cookies() might not be available outside request context
  }
  return false;
}

export function isMockModeAvailable() {
  return process.env.NODE_ENV !== "production" && process.env.ENABLE_MOCK_DATA !== "false";
}

type SupabaseScoreRow = {
  id: string;
  student_id: string;
  game_id: string;
  score: number;
  team_name: string | null;
  updated_at: string;
  student: {
    id: string;
    student_number: string;
    nickname: string;
    department_id: string;
  };
};

type UpdatedScoreRow = {
  result_score_id: string;
  result_student_id: string;
  result_student_number: string;
  result_student_nickname: string;
  result_team_name: string | null;
  result_display_name: string;
  result_department_id: string;
  result_game_id: string;
  result_score: number;
  result_updated_at: string;
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
  state: "mock" | "ready" | "error";
  totalRows: number;
  error: string | null;
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
    nickname: row.team_name ?? row.student.nickname,
    score: row.score,
    createdAt: row.updated_at,
    teamName: row.team_name ?? null,
  };
}

async function fetchPublicScoreRows() {
  const select = [
    "id",
    "student_id",
    "game_id",
    "score",
    "team_name",
    "updated_at",
    "student:students!scores_student_id_fkey(id,nickname,department_id)",
  ].join(",");
  return supabaseRest<SupabaseScoreRow[]>(
    `scores?select=${encodeURIComponent(select)}&deleted_at=is.null&order=updated_at.asc`,
  );
}

const getCachedPublicScoreRows = unstable_cache(
  fetchPublicScoreRows,
  ["public-score-rows"],
  { revalidate: 5, tags: ["scores"] },
);

export async function getScoreSnapshot(): Promise<ScoreSnapshot> {
  const forceMock = await isMockModeActive();
  if (forceMock) {
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

  if (!isSupabaseConfigured()) {
    return {
      scores: [],
      status: {
        mode: "supabase",
        state: "error",
        totalRows: 0,
        error: "Supabase 환경 변수가 설정되지 않았습니다.",
      },
    };
  }

  try {
    const rows = await getCachedPublicScoreRows();
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
  } catch (error) {
    console.error("Supabase score fetch failed", error);
    const message = error instanceof Error ? error.message : "순위 저장소에 연결하지 못했습니다.";
    return {
      scores: [],
      status: {
        mode: "supabase",
        state: "error",
        totalRows: 0,
        error: message,
      },
    };
  }
}

export async function getAllScores() {
  const snapshot = await getScoreSnapshot();
  if (snapshot.status.state === "error") {
    throw new Error(snapshot.status.error ?? "순위 저장소에 연결하지 못했습니다.");
  }
  return snapshot.scores;
}

export async function getAdminScoreRecords(): Promise<AdminScoreRecord[]> {
  const forceMock = await isMockModeActive();
  if (forceMock) return getMockAdminScoreRecords();
  if (!isSupabaseConfigured()) throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");

  try {
    const select = [
      "id",
      "student_id",
      "game_id",
      "score",
      "team_name",
      "updated_at",
      "student:students!scores_student_id_fkey(id,student_number,nickname,department_id)",
    ].join(",");
    const rows = await supabaseRest<SupabaseScoreRow[]>(
      `scores?select=${encodeURIComponent(select)}&deleted_at=is.null&order=updated_at.desc&limit=200`,
    );

    return rows.map((row) => ({
      ...publicScore(row),
      studentNumber: row.student.student_number,
      studentNickname: row.student.nickname,
      teamName: row.team_name,
    }));
  } catch (error) {
    console.error("Supabase admin score fetch failed", error);
    throw error;
  }
}

export async function getStudentProfile(studentNumber: string) {
  if (await isMockModeActive()) {
    return getMockStudentProfile(studentNumber);
  }
  if (!isSupabaseConfigured()) throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");

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
  teamName: string | null;
  score: number;
}) {
  if (await isMockModeActive()) {
    return createMockManualScore({
      ...input,
      deviceId: input.gameId,
    });
  }
  if (!isSupabaseConfigured()) throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");

  const rows = await supabaseRest<UpsertScoreRow[]>("rpc/upsert_admin_score", {
    method: "POST",
    body: JSON.stringify({
      p_student_number: input.studentId,
      p_game_id: input.gameId,
      p_department_id: input.departmentId,
      p_nickname: input.nickname,
      p_team_name: input.teamName,
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

export async function updateAdminScore(
  scoreId: string,
  input: { departmentId: string; displayName: string; score: number },
) {
  if (await isMockModeActive()) {
    return updateMockAdminScore(scoreId, {
      departmentId: input.departmentId,
      nickname: input.displayName,
      score: input.score,
    });
  }
  if (!isSupabaseConfigured()) throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");

  const rows = await supabaseRest<UpdatedScoreRow[]>("rpc/update_admin_score", {
    method: "POST",
    body: JSON.stringify({
      p_score_id: scoreId,
      p_department_id: input.departmentId,
      p_display_name: input.displayName,
      p_score: input.score,
    }),
  });
  const row = rows[0];
  if (!row) return null;

  return {
    id: row.result_score_id,
    sessionId: row.result_score_id,
    playerId: row.result_student_id,
    studentNumber: row.result_student_number,
    studentNickname: row.result_student_nickname,
    teamName: row.result_team_name,
    gameId: row.result_game_id,
    departmentId: row.result_department_id,
    nickname: row.result_display_name,
    score: row.result_score,
    createdAt: row.result_updated_at,
  } satisfies AdminScoreRecord;
}

export async function deleteAdminScore(scoreId: string) {
  if (await isMockModeActive()) return deleteMockAdminScore(scoreId);
  if (!isSupabaseConfigured()) throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");

  return supabaseRest<boolean>("rpc/delete_admin_score", {
    method: "POST",
    body: JSON.stringify({ p_score_id: scoreId }),
  });
}
