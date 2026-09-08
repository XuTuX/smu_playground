import { isValidAdminRequest } from "@/lib/admin-auth";
import { getStudentProfile } from "@/lib/score-store";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  if (!isValidAdminRequest(request)) {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { studentId } = await params;
  if (!/^\d{6,12}$/u.test(studentId)) {
    return Response.json({ found: false });
  }

  try {
    const student = await getStudentProfile(studentId);
    return Response.json(
      student ? { found: true, student } : { found: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to look up student", error);
    return Response.json(
      { error: "학생 정보를 조회하지 못했습니다." },
      { status: 503 },
    );
  }
}
