import { ADMIN_COOKIE, isSameOriginRequest } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
  }
  return Response.json(
    { success: true },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
      },
    },
  );
}
