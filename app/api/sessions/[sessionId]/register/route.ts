import { isValidAdminRequest } from "@/lib/admin-auth";
import { registerGameSession } from "@/lib/mock-store";
import { validateRegistration } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  if (!isValidAdminRequest(request)) {
    return Response.json({ success: false, error: "관리자 인증이 필요합니다." }, { status: 401 });
  }
  const { sessionId } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ success: false, error: "JSON 요청이 필요합니다." }, { status: 400 }); }
  const validation = validateRegistration(body);
  if (!validation.ok) return Response.json({ success: false, error: validation.error }, { status: 400 });
  const result = registerGameSession({ sessionId, ...validation.value });
  if (!result) return Response.json({ success: false, error: "이미 등록됐거나 만료된 점수입니다." }, { status: 409 });
  return Response.json({ success: true, result });
}
