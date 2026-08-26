import { ADMIN_COOKIE } from "@/lib/admin-auth";

export async function POST() { return Response.json({ success: true }, { headers: { "Set-Cookie": `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0` } }); }
