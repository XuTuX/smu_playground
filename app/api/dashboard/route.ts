import { getAllScores } from "@/lib/score-store";
import { getDashboardData } from "@/lib/ranking";

export const dynamic = "force-dynamic";
export async function GET() { return Response.json(getDashboardData(await getAllScores()), { headers: { "Cache-Control": "no-store" } }); }
