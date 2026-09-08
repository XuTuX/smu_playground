import { isValidAdminRequest } from "@/lib/admin-auth";
import { getDashboardData } from "@/lib/ranking";
import { getAdminScoreRecords, getScoreSnapshot } from "@/lib/score-store";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!isValidAdminRequest(request)) return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  try {
    const [snapshot, records] = await Promise.all([
      getScoreSnapshot(),
      getAdminScoreRecords(),
    ]);
    const dashboard = getDashboardData(snapshot.scores);
    return Response.json({ summary: { playCount: dashboard.playCount, playerCount: dashboard.playerCount, champion: dashboard.champion.departmentName }, sync: snapshot.status, records }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Supabase 연결에 실패했습니다.";
    return Response.json({ summary: { playCount: 0, playerCount: 0, champion: "확인 필요" }, sync: { mode: "supabase", state: "error", totalRows: 0, error: message }, records: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
