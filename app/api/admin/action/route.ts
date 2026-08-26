import { isValidAdminRequest } from "@/lib/admin-auth";
import { expireGameSession, resetEventData } from "@/lib/mock-store";

export async function POST(request: Request) {
  if (!isValidAdminRequest(request)) return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  let body: unknown; try { body = await request.json(); } catch { return Response.json({ error: "JSON 요청이 필요합니다." }, { status: 400 }); }
  const action = (body as { action?: unknown })?.action;
  if (action === "reset") { resetEventData(); return Response.json({ success: true }); }
  if (action === "expire_session") { const sessionId = (body as { sessionId?: unknown }).sessionId; if (typeof sessionId !== "string" || !expireGameSession(sessionId)) return Response.json({ error: "대기 중인 세션을 찾을 수 없습니다." }, { status: 404 }); return Response.json({ success: true }); }
  return Response.json({ error: "지원하지 않는 관리자 작업입니다." }, { status: 400 });
}
