import { isValidAdminRequest } from "@/lib/admin-auth";
import { getRecentSessions } from "@/lib/mock-store";
import { getDashboardData } from "@/lib/ranking";
import { getScoreSnapshot } from "@/lib/score-store";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!isValidAdminRequest(request)) return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  try {
    const snapshot = await getScoreSnapshot(); const dashboard = getDashboardData(snapshot.scores);
    return Response.json({ summary: { playCount: dashboard.playCount, playerCount: dashboard.playerCount, champion: dashboard.champion.departmentName }, sync: snapshot.status, issues: snapshot.issues.slice(0, 20), sessions: getRecentSessions(30) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google Sheets 동기화에 실패했습니다.";
    return Response.json({ summary: { playCount: 0, playerCount: 0, champion: "확인 필요" }, sync: { mode: "google-sheets", state: "stale", lastSyncedAt: null, issueCount: 0, totalRows: 0, error: message }, issues: [], sessions: getRecentSessions(30) }, { headers: { "Cache-Control": "no-store" } });
  }
}
