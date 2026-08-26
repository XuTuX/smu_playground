import { createGameSession } from "@/lib/mock-store";
import { validateDeviceScore } from "@/lib/validation";

export async function POST(request: Request) {
  const configuredKey = process.env.DEVICE_API_KEY;
  const providedKey = request.headers.get("x-device-key");
  const developmentAccess = process.env.NODE_ENV === "development" && providedKey === "dev-local";

  if (!developmentAccess && (!configuredKey || providedKey !== configuredKey)) {
    return Response.json({ success: false, error: "유효하지 않은 기기 키입니다." }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ success: false, error: "JSON 요청이 필요합니다." }, { status: 400 }); }
  const validation = validateDeviceScore(body);
  if (!validation.ok) return Response.json({ success: false, error: validation.error }, { status: 400 });

  const session = createGameSession(validation.value);
  return Response.json({ success: true, session_id: session.id, score: session.score }, { status: 201 });
}
