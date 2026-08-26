import { getGame } from "@/data/games";
import { isValidAdminRequest } from "@/lib/admin-auth";
import { getPendingGameSession } from "@/lib/mock-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ deviceId: string }> }) {
  if (!isValidAdminRequest(request)) {
    return Response.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
  }
  const { deviceId } = await params;
  const game = getGame(deviceId);
  if (!game) return Response.json({ error: "등록되지 않은 기기입니다." }, { status: 404 });
  const session = getPendingGameSession(game.deviceId);
  return Response.json({ session: session ? { id: session.id, gameId: session.gameId, score: session.score, createdAt: session.createdAt } : null }, { headers: { "Cache-Control": "no-store" } });
}
