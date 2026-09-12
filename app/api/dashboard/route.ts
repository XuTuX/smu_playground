import { getAllScores } from "@/lib/score-store";
import { getDashboardData } from "@/lib/ranking";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json(getDashboardData(await getAllScores()), {
      headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10" },
    });
  } catch (error) {
    console.error("Failed to load dashboard data", error);
    return Response.json(
      { error: "순위 데이터를 불러오지 못했습니다." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
