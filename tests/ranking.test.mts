import assert from "node:assert/strict";
import test from "node:test";
import { getDepartmentStandings, getOverallPlayerStandings, getTeamStandings } from "@/lib/ranking";
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

test("학과 점수는 5개 게임에서 각 학과 1위 기록만 합산한다", () => {
  const scores = [100, 90, 80, 70, 60, 50].map((value, index) =>
    score(String(index), `p${index}`, "timing", "ai-computer", `참가자${index}`, value),
  );

  const standing = getDepartmentStandings(scores)[0];
  assert.equal(standing.departmentId, "ai-computer");
  assert.equal(standing.totalScore, 100);
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
    score("1", "student-a", "memory", "nursing", "파랑", 100),
    score("2", "student-a", "memory", "nursing", "파랑", 80),
    score("3", "student-a", "jump", "nursing", "파랑", 90),
    score("4", "student-a", "parking", "nursing", "파랑팀", 999),
    score("5", "student-b", "memory", "business", "초록", 150),
  ];

  const standings = getOverallPlayerStandings(scores);
  assert.equal(standings[0].nickname, "파랑");
  assert.equal(standings[0].score, 190);
  assert.equal(standings[1].score, 150);
});

test("개인 상세 순위는 각 게임별 점수 구성을 올바르게 반환한다", async () => {
  const scores = [
    score("1", "student-a", "memory", "nursing", "민준", 100),
    score("2", "student-a", "jump", "nursing", "민준", 90),
  ];

  const { getDetailedPlayerStandings } = await import("@/lib/ranking");
  const detailed = getDetailedPlayerStandings(scores);
  assert.equal(detailed[0].nickname, "민준");
  assert.equal(detailed[0].totalScore, 190);
  assert.equal(detailed[0].gameScores.length, 2);
  assert.equal(detailed[0].gameScores[0].score, 100);
});

test("팀 순위는 같은 참가자 ID의 팀전 3개 최고 점수를 합산한다", () => {
  const scores = [
    { ...score("1", "student-a", "parking", "ai-computer", "청춘MAX", 500), teamName: "청춘MAX" },
    { ...score("2", "student-a", "star", "ai-computer", "청춘MAX", 400), teamName: "청춘max" },
    { ...score("3", "student-a", "rope", "ai-computer", "청춘MAX", 300), teamName: "청춘MAX" },
    { ...score("4", "student-b", "parking", "business", "파이널보스", 600), teamName: "파이널보스" },
  ];

  const teamStandings = getTeamStandings(scores);
  assert.equal(teamStandings[0].teamName, "청춘MAX");
  assert.equal(teamStandings[0].score, 1200);
  assert.equal(teamStandings[0].gameCount, 3);
  assert.equal(teamStandings[1].score, 600);
});

test("팀명이 같아도 참가자 ID가 다르면 별도 팀으로 계산한다", () => {
  const scores = [
    { ...score("1", "team-a", "parking", "ai-computer", "청춘", 500), teamName: "청춘" },
    { ...score("2", "team-b", "star", "business", "청춘", 400), teamName: "청춘" },
  ];

  const teamStandings = getTeamStandings(scores);
  assert.equal(teamStandings.length, 2);
  assert.deepEqual(teamStandings.map(({ score: value }) => value), [500, 400]);
});

test("전화번호가 같고 게임마다 다른 닉네임을 써도 동일인으로 통합되고 최신 닉네임이 반영된다", async () => {
  const scores = [
    {
      ...score("1", "student-old", "timing", "nursing", "예전자동차", 100),
      participantPhone: "010-1234-5678",
      createdAt: "2026-09-12T10:00:00Z",
    },
    {
      ...score("2", "student-new", "rhythm", "nursing", "최신주차왕", 90),
      participantPhone: "010-1234-5678",
      createdAt: "2026-09-12T11:00:00Z",
    },
    {
      ...score("3", "student-other", "timing", "business", "다른사람", 150),
      participantPhone: "010-9999-8888",
      createdAt: "2026-09-12T10:30:00Z",
    },
  ];

  const standings = getOverallPlayerStandings(scores);
  // Total 2 unique players
  assert.equal(standings.length, 2);

  // 010-1234-5678 should have total score 100 + 90 = 190 and display the newest nickname "최신주차왕"
  const unified = standings.find((s) => s.nickname === "최신주차왕");
  assert.ok(unified);
  assert.equal(unified.score, 190);

  // Old nickname "예전자동차" should NOT exist as a separate player
  assert.equal(standings.some((s) => s.nickname === "예전자동차"), false);

  const { getDetailedPlayerStandings } = await import("@/lib/ranking");
  const detailed = getDetailedPlayerStandings(scores);
  const detailedUnified = detailed.find((s) => s.nickname === "최신주차왕");
  assert.ok(detailedUnified);
  assert.equal(detailedUnified.totalScore, 190);
  assert.equal(detailedUnified.gameCount, 2);
});

