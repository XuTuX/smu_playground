import {
  ADMIN_COOKIE,
  createAdminToken,
  getAdminConfigurationError,
  isSameOriginRequest,
  isValidAdminPassword,
} from "@/lib/admin-auth";
import { checkRateLimit, requestClientKey, resetRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
  }

  const configurationError = getAdminConfigurationError();
  if (configurationError) {
    return Response.json({ error: configurationError }, { status: 503 });
  }

  const clientKey = `admin-login:${requestClientKey(request)}`;
  const rateLimit = checkRateLimit(clientKey, 5, 10 * 60 * 1_000);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON 요청이 필요합니다." }, { status: 400 });
  }
  const password = typeof (body as { password?: unknown })?.password === "string" ? (body as { password: string }).password : "";
  if (!isValidAdminPassword(password)) return Response.json({ error: "관리자 비밀번호가 올바르지 않습니다." }, { status: 401 });
  resetRateLimit(clientKey);
  const token = createAdminToken();
  if (!token) return Response.json({ error: "관리자 환경 설정이 필요합니다." }, { status: 503 });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return Response.json(
    { success: true },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800; Priority=High${secure}`,
      },
    },
  );
}
