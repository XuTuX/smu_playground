import { isValidAdminRequest } from "@/lib/admin-auth";
import { createManualScore } from "@/lib/score-store";
import { validateAdminScore } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isValidAdminRequest(request)) {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON 요청이 필요합니다." }, { status: 400 });
  }

  const validation = validateAdminScore(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  try {
    const result = await createManualScore(validation.value);
    return Response.json({ success: true, ...result }, { status: result.status === "created" ? 201 : 200 });
  } catch (error) {
    console.error("Failed to save admin score", error);
    return Response.json({ error: "점수 저장소에 연결하지 못했습니다. 동기화 설정을 확인해주세요." }, { status: 503 });
  }
}
