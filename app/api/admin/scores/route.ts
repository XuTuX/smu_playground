import { isValidAdminRequest } from "@/lib/admin-auth";
import { createManualScore } from "@/lib/mock-store";
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

  const result = createManualScore(validation.value);
  return Response.json({ success: true, ...result }, { status: result.status === "created" ? 201 : 200 });
}
