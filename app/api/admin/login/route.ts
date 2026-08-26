import { ADMIN_COOKIE, createAdminToken, isValidAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: unknown; try { body = await request.json(); } catch { return Response.json({ error: "JSON 요청이 필요합니다." }, { status: 400 }); }
  const password = typeof (body as { password?: unknown })?.password === "string" ? (body as { password: string }).password : "";
  if (!isValidAdminPassword(password)) return Response.json({ error: "관리자 비밀번호가 올바르지 않습니다." }, { status: 401 });
  const token = createAdminToken(); if (!token) return Response.json({ error: "관리자 환경 설정이 필요합니다." }, { status: 503 });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return Response.json({ success: true }, { headers: { "Set-Cookie": `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${secure}` } });
}
