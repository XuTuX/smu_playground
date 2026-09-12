import { isValidAdminRequest } from "@/lib/admin-auth";
import { getAdminSnapshot } from "@/lib/admin-snapshot";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!isValidAdminRequest(request)) return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  return Response.json(await getAdminSnapshot(), {
    headers: { "Cache-Control": "no-store" },
  });
}
