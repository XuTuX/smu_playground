import { revalidateTag } from "next/cache";
import { isSameOriginRequest, isValidAdminRequest } from "@/lib/admin-auth";
import { checkRateLimit, requestClientKey } from "@/lib/rate-limit";
import { createManualScore } from "@/lib/score-store";
import { validateAdminScore } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
  }
  if (!isValidAdminRequest(request)) {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`admin-write:${requestClientKey(request)}`, 120, 60_000);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
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
    revalidateTag("scores", { expire: 0 });
    return Response.json({ success: true, ...result }, { status: result.status === "created" ? 201 : 200 });
  } catch (error) {
    console.error("Failed to save admin score", error);
    return Response.json({ error: "점수 저장소에 연결하지 못했습니다. 동기화 설정을 확인해주세요." }, { status: 503 });
  }
}
