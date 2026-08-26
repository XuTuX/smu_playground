import { getDepartment } from "@/data/departments";
import { getGame } from "@/data/games";

export function validateDeviceScore(input: unknown) {
  if (!input || typeof input !== "object") {
    return { ok: false as const, error: "요청 형식이 올바르지 않습니다." };
  }

  const body = input as Record<string, unknown>;
  const deviceId = typeof body.device_id === "string" ? body.device_id.trim() : "";
  const gameId = typeof body.game_id === "string" ? body.game_id.trim() : "";
  const eventId = typeof body.event_id === "string" ? body.event_id.trim() : null;
  const score = typeof body.score === "number" ? body.score : Number.NaN;
  const game = getGame(gameId);

  if (!deviceId || !game || game.deviceId !== deviceId.toUpperCase()) {
    return { ok: false as const, error: "기기와 게임 정보가 일치하지 않습니다." };
  }
  if (!Number.isSafeInteger(score) || score < 0 || score > game.maxScore) {
    return { ok: false as const, error: `점수는 0~${game.maxScore} 정수여야 합니다.` };
  }
  if (eventId && (eventId.length > 64 || !/^[a-zA-Z0-9._:-]+$/.test(eventId))) {
    return { ok: false as const, error: "event_id 형식이 올바르지 않습니다." };
  }

  return {
    ok: true as const,
    value: { deviceId: game.deviceId, gameId: game.id, score, eventId },
  };
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
  const game = getGame(gameId);
  const registration = validateRegistration(input);
  const score = typeof body.score === "number" ? body.score : Number.NaN;

  if (!game?.isActive) {
    return { ok: false as const, error: "게임을 선택해주세요." };
  }
  if (!registration.ok) return registration;
  if (!/^\d{6,12}$/.test(studentId)) {
    return { ok: false as const, error: "학번은 숫자 6~12자리로 입력해주세요." };
  }
  if (!Number.isSafeInteger(score) || score < 0 || score > game.maxScore) {
    return { ok: false as const, error: `점수는 0~${game.maxScore} 정수여야 합니다.` };
  }

  return {
    ok: true as const,
    value: {
      gameId: game.id,
      deviceId: game.deviceId ?? game.id,
      studentId,
      departmentId: registration.value.departmentId,
      nickname: registration.value.nickname,
      score,
    },
  };
}
