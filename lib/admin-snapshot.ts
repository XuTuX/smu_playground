import "server-only";

import { getDashboardData } from "@/lib/ranking";
import { getAdminScoreRecords, getScoreSnapshot } from "@/lib/score-store";
import type { AdminScoreRecord } from "@/lib/types";

export type AdminSnapshot = {
  summary: { playCount: number; champion: string };
  sync: {
    mode: "mock" | "supabase";
    state: "mock" | "ready" | "error";
    totalRows: number;
    error: string | null;
  };
  records: AdminScoreRecord[];
};

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  try {
    const [snapshot, records] = await Promise.all([
      getScoreSnapshot(),
      getAdminScoreRecords(),
    ]);
    const dashboard = getDashboardData(snapshot.scores);

    return {
      summary: {
        playCount: dashboard.playCount,
        champion: dashboard.champion.departmentName,
      },
      sync: snapshot.status,
      records,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Supabase 연결에 실패했습니다.";

    return {
      summary: { playCount: 0, champion: "확인 필요" },
      sync: {
        mode: "supabase",
        state: "error",
        totalRows: 0,
        error: message,
      },
      records: [],
    };
  }
}
