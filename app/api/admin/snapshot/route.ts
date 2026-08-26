import { isValidAdminRequest } from "@/lib/admin-auth";
import { getAllScores, getRecentSessions } from "@/lib/mock-store";
import { getDashboardData } from "@/lib/ranking";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!isValidAdminRequest(request)) return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  const scores = getAllScores(); const dashboard = getDashboardData(scores);
  return Response.json({ summary: { playCount: dashboard.playCount, playerCount: dashboard.playerCount, champion: dashboard.champion.departmentName }, sessions: getRecentSessions(30) }, { headers: { "Cache-Control": "no-store" } });
}
