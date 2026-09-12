import { getDepartment } from "@/data/departments";
import { getGame } from "@/data/games";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export function isValidScoreId(value: string) {
  return UUID_PATTERN.test(value);
}

export function validateRegistration(input: unknown) {
  if (!input || typeof input !== "object") {
    return { ok: false as const, error: "요청 형식이 올바르지 않습니다." };
  }

  const body = input as Record<string, unknown>;
  const departmentId =
    typeof body.department_id === "string" ? body.department_id.trim() : "";
  const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
  const department = getDepartment(departmentId);

  if (!department?.isActive) {
    return { ok: false as const, error: "활성 학과를 선택해주세요." };
  }
  if (nickname.length < 2 || nickname.length > 12) {
    return { ok: false as const, error: "닉네임은 2~12자로 입력해주세요." };
  }
  if (/[<>\u0000-\u001f\u007f]/u.test(nickname)) {
    return { ok: false as const, error: "닉네임에 사용할 수 없는 문자가 있습니다." };
  }

  return { ok: true as const, value: { departmentId, nickname } };
}

export function validateAdminScore(input: unknown) {
  if (!input || typeof input !== "object") {
    return { ok: false as const, error: "요청 형식이 올바르지 않습니다." };
  }

  const body = input as Record<string, unknown>;
  const gameId = typeof body.game_id === "string" ? body.game_id.trim() : "";
  const studentId = typeof body.student_id === "string" ? body.student_id.trim() : "";
  const representativePhone =
    typeof body.representative_phone === "string"
      ? body.representative_phone.replace(/\D/g, "")
      : "";
  const game = getGame(gameId);
  const departmentId =
    typeof body.department_id === "string" ? body.department_id.trim() : "";
  const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
  const department = getDepartment(departmentId);
  const teamName = typeof body.team_name === "string" ? body.team_name.trim() : "";
  const score = typeof body.score === "number" ? body.score : Number.NaN;

  if (!game?.isActive) {
    return { ok: false as const, error: "게임을 선택해주세요." };
  }
  if (!department?.isActive) {
    return { ok: false as const, error: "활성 학과를 선택해주세요." };
  }
  if (game.rankingMode === "individual" && (nickname.length < 2 || nickname.length > 12)) {
    return { ok: false as const, error: "닉네임은 2~12자로 입력해주세요." };
  }
  if (game.rankingMode === "individual" && /[<>\u0000-\u001f\u007f]/u.test(nickname)) {
    return { ok: false as const, error: "닉네임에 사용할 수 없는 문자가 있습니다." };
  }
  if (game.rankingMode === "team" && (teamName.length < 2 || teamName.length > 12)) {
    return { ok: false as const, error: "팀명은 2~12자로 입력해주세요." };
  }
  if (game.rankingMode === "team" && /[<>\u0000-\u001f\u007f]/u.test(teamName)) {
    return { ok: false as const, error: "팀명에 사용할 수 없는 문자가 있습니다." };
  }
  if (game.rankingMode === "individual" && !/^\d{6,12}$/.test(studentId)) {
    return { ok: false as const, error: "학번은 숫자 6~12자리로 입력해주세요." };
  }
  if (game.rankingMode === "team" && !/^01[016789]\d{7,8}$/.test(representativePhone)) {
    return { ok: false as const, error: "대표자 전화번호를 숫자 10~11자리로 입력해주세요." };
  }
  if (!Number.isSafeInteger(score) || score < 0 || score > game.maxScore) {
    return { ok: false as const, error: `점수는 0~${game.maxScore} 정수여야 합니다.` };
  }

  return {
    ok: true as const,
    value: {
      gameId: game.id,
      studentId: game.rankingMode === "individual" ? studentId : null,
      representativePhone: game.rankingMode === "team" ? representativePhone : null,
      departmentId,
      nickname: game.rankingMode === "individual" ? nickname : teamName,
      teamName: game.rankingMode === "team" ? teamName : null,
      score,
    },
  };
}

export function validateAdminScoreEdit(input: unknown) {
  if (!input || typeof input !== "object") {
    return { ok: false as const, error: "요청 형식이 올바르지 않습니다." };
  }

  const body = input as Record<string, unknown>;
  const registration = validateRegistration(input);
  const gameId = typeof body.game_id === "string" ? body.game_id.trim() : "";
  const game = getGame(gameId);
  const score = typeof body.score === "number" ? body.score : Number.NaN;

  if (!game?.isActive) {
    return { ok: false as const, error: "게임 정보를 확인할 수 없습니다." };
  }
  if (!registration.ok) return registration;
  if (!Number.isSafeInteger(score) || score < 0 || score > game.maxScore) {
    return { ok: false as const, error: `점수는 0~${game.maxScore} 정수여야 합니다.` };
  }

  return {
    ok: true as const,
    value: {
      departmentId: registration.value.departmentId,
      displayName: registration.value.nickname,
      score,
    },
  };
}
