import { isValidAdminRequest } from "@/lib/admin-auth";
import { getParticipantProfile } from "@/lib/score-store";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ phone: string }> },
) {
  if (!isValidAdminRequest(request)) {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { phone } = await params;
  const rawKind = new URL(request.url).searchParams.get("kind");
  const participantKind = rawKind === "team" ? "team" : rawKind === "individual" ? "individual" : null;
  if (!/^01[016789]\d{7,8}$/u.test(phone)) {
    return Response.json({ found: false });
  }

  try {
    const participant = await getParticipantProfile(phone, participantKind);
    return Response.json(
      participant ? { found: true, participant } : { found: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to look up participant", error);
    return Response.json(
      { error: "참가자 정보를 조회하지 못했습니다." },
      { status: 503 },
    );
  }
}
