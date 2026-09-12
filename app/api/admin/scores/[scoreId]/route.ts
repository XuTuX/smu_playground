import { revalidateTag } from "next/cache";
import { isSameOriginRequest, isValidAdminRequest } from "@/lib/admin-auth";
import { checkRateLimit, requestClientKey } from "@/lib/rate-limit";
import { deleteAdminScore, updateAdminScore } from "@/lib/score-store";
import { isValidScoreId, validateAdminScoreEdit } from "@/lib/validation";

type RouteContext = { params: Promise<{ scoreId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
  }
  if (!isValidAdminRequest(request)) {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  const rateLimit = checkRateLimit(`admin-write:${requestClientKey(request)}`, 120, 60_000);
  if (!rateLimit.allowed) {
    return Response.json({ error: "요청이 너무 많습니다." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON 요청이 필요합니다." }, { status: 400 });
  }

  const validation = validateAdminScoreEdit(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  try {
    const { scoreId } = await params;
    if (!isValidScoreId(scoreId) && !scoreId.startsWith("mock-score-")) {
      return Response.json({ error: "점수 기록 ID가 올바르지 않습니다." }, { status: 400 });
    }
    const score = await updateAdminScore(scoreId, validation.value);
    if (!score) {
      return Response.json({ error: "수정할 점수 기록을 찾을 수 없습니다." }, { status: 404 });
    }
    revalidateTag("scores", { expire: 0 });
    return Response.json({ success: true, score });
  } catch (error) {
    console.error("Failed to update admin score", error);
    return Response.json({ error: "점수를 수정하지 못했습니다." }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
  }
  if (!isValidAdminRequest(request)) {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  const rateLimit = checkRateLimit(`admin-write:${requestClientKey(request)}`, 120, 60_000);
  if (!rateLimit.allowed) {
    return Response.json({ error: "요청이 너무 많습니다." }, { status: 429 });
  }

  try {
    const { scoreId } = await params;
    if (!isValidScoreId(scoreId) && !scoreId.startsWith("mock-score-")) {
      return Response.json({ error: "점수 기록 ID가 올바르지 않습니다." }, { status: 400 });
    }
    const deleted = await deleteAdminScore(scoreId);
    if (!deleted) {
      return Response.json({ error: "삭제할 점수 기록을 찾을 수 없습니다." }, { status: 404 });
    }
    revalidateTag("scores", { expire: 0 });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete admin score", error);
    return Response.json({ error: "점수를 삭제하지 못했습니다." }, { status: 503 });
  }
}
