import assert from "node:assert/strict";
import test from "node:test";
import { filterAdminRecords } from "@/lib/admin-record-filter";
import type { AdminScoreRecord } from "@/lib/types";

function record(
  id: string,
  gameId: string,
  departmentId: string,
  nickname: string,
  participantPhone: string,
): AdminScoreRecord {
  return {
    id,
    sessionId: id,
    playerId: id,
    gameId,
    departmentId,
    nickname,
    score: 100,
    createdAt: "2026-09-12T00:00:00.000Z",
    participantKind: gameId === "parking" ? "team" : "individual",
    participantPhone,
    teamName: gameId === "parking" ? nickname : null,
  };
}

const records = [
  record("1", "parking", "ai-computer", "청룡팀", "01012345678"),
  record("2", "parking", "business", "백호팀", "01087654321"),
  record("3", "memory", "ai-computer", "개인참가자", "01011112222"),
];

test("선택한 게임의 기록만 표시한다", () => {
  assert.deepEqual(
    filterAdminRecords(records, "parking", "").map(({ id }: AdminScoreRecord) => id),
    ["1", "2"],
  );
});

test("전화번호, 이름, 학과명으로 선택 게임 기록을 검색한다", () => {
  assert.deepEqual(
    filterAdminRecords(records, "parking", "010-1234").map(({ id }: AdminScoreRecord) => id),
    ["1"],
  );
  assert.deepEqual(
    filterAdminRecords(records, "parking", "백호").map(({ id }: AdminScoreRecord) => id),
    ["2"],
  );
  assert.deepEqual(
    filterAdminRecords(records, "parking", "AI컴퓨터").map(({ id }: AdminScoreRecord) => id),
    ["1"],
  );
});
