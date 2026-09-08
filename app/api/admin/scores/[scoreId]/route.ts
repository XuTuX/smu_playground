import { isValidAdminRequest } from "@/lib/admin-auth";
import { deleteAdminScore, updateAdminScore } from "@/lib/score-store";
import { validateAdminScoreEdit } from "@/lib/validation";

type RouteContext = { params: Promise<{ scoreId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!isValidAdminRequest(request)) {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
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
    const score = await updateAdminScore(scoreId, validation.value);
    if (!score) {
      return Response.json({ error: "수정할 점수 기록을 찾을 수 없습니다." }, { status: 404 });
    }
    return Response.json({ success: true, score });
  } catch (error) {
    console.error("Failed to update admin score", error);
    return Response.json({ error: "점수를 수정하지 못했습니다." }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!isValidAdminRequest(request)) {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const { scoreId } = await params;
    const deleted = await deleteAdminScore(scoreId);
    if (!deleted) {
      return Response.json({ error: "삭제할 점수 기록을 찾을 수 없습니다." }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete admin score", error);
    return Response.json({ error: "점수를 삭제하지 못했습니다." }, { status: 503 });
  }
}
