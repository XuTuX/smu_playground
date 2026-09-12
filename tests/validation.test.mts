import assert from "node:assert/strict";
import test from "node:test";
import { isValidScoreId, validateAdminScore, validateAdminScoreEdit } from "@/lib/validation";

const baseScore = {
  game_id: "timing",
  student_id: "20260001",
  department_id: "ai-computer",
  nickname: "테스터",
  score: 100,
};

test("개인전 관리자 점수 입력을 검증한다", () => {
  const result = validateAdminScore(baseScore);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.teamName, null);
});

test("팀전에는 별도 팀명이 필요하다", () => {
  const missing = validateAdminScore({ ...baseScore, game_id: "flappy" });
  assert.equal(missing.ok, false);

  const valid = validateAdminScore({
    ...baseScore,
    game_id: "flappy",
    team_name: "청룡팀",
  });
  assert.equal(valid.ok, true);
  if (valid.ok) assert.equal(valid.value.teamName, "청룡팀");
});

test("점수 수정은 해당 게임의 최대 점수를 적용한다", () => {
  const result = validateAdminScoreEdit({
    game_id: "timing",
    department_id: "ai-computer",
    nickname: "테스터",
    score: 10_000,
  });
  assert.equal(result.ok, false);
});

test("Supabase 점수 UUID 형식을 확인한다", () => {
  assert.equal(isValidScoreId("550e8400-e29b-41d4-a716-446655440000"), true);
  assert.equal(isValidScoreId("not-a-uuid"), false);
});
