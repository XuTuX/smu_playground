import assert from "node:assert/strict";
import test from "node:test";
import { getDepartmentStandings, getOverallPlayerStandings } from "@/lib/ranking";
import type { ScoreRecord } from "@/lib/types";

function score(
  id: string,
  playerId: string,
  gameId: string,
  departmentId: string,
  nickname: string,
  value: number,
): ScoreRecord {
  return {
    id,
    sessionId: id,
    playerId,
    gameId,
    departmentId,
    nickname,
    score: value,
    createdAt: `2026-09-12T00:00:${id.padStart(2, "0")}Z`,
  };
}

test("학과 점수는 게임별 상위 5개 기록만 합산한다", () => {
  const scores = [100, 90, 80, 70, 60, 50].map((value, index) =>
    score(String(index), `p${index}`, "timing", "ai-computer", `참가자${index}`, value),
  );

  const standing = getDepartmentStandings(scores)[0];
  assert.equal(standing.departmentId, "ai-computer");
  assert.equal(standing.totalScore, 400);
  assert.equal(standing.playerCount, 6);
});

test("같은 닉네임도 학생 ID가 다르면 별도 참가자로 계산한다", () => {
  const scores = [
    score("1", "student-a", "timing", "nursing", "같은이름", 100),
    score("2", "student-b", "rhythm", "nursing", "같은이름", 90),
  ];

  assert.equal(getDepartmentStandings(scores)[0].playerCount, 2);
});

test("개인 종합 순위는 팀전을 제외하고 게임별 최고 점수를 합산한다", () => {
  const scores = [
    score("1", "student-a", "timing", "nursing", "파랑", 100),
    score("2", "student-a", "timing", "nursing", "파랑", 80),
    score("3", "student-a", "rhythm", "nursing", "파랑", 90),
    score("4", "student-a", "flappy", "nursing", "파랑팀", 999),
    score("5", "student-b", "timing", "business", "초록", 150),
  ];

  const standings = getOverallPlayerStandings(scores);
  assert.equal(standings[0].nickname, "파랑");
  assert.equal(standings[0].score, 190);
  assert.equal(standings[1].score, 150);
});
