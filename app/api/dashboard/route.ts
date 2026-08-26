import { getAllScores } from "@/lib/mock-store";
import { getDashboardData } from "@/lib/ranking";

export const dynamic = "force-dynamic";
export async function GET() { return Response.json(getDashboardData(getAllScores()), { headers: { "Cache-Control": "no-store" } }); }
