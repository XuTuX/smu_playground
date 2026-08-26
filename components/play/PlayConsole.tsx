"use client";

import { useEffect, useRef, useState } from "react";
import { DepartmentPicker } from "@/components/play/DepartmentPicker";
import { PressableLink } from "@/components/ui/PressableLink";
import type {
  College,
  Department,
  Game,
  RegistrationResult,
} from "@/lib/types";

type SessionSnapshot = {
  id: string;
  gameId: string;
  score: number;
  createdAt: string;
};
type CollegeGroup = College & { departments: Department[] };

export function PlayConsole({
  game,
  collegeGroups,
  resetSeconds,
}: {
  game: Game;
  collegeGroups: CollegeGroup[];
  resetSeconds: number;
}) {
  const [session, setSession] = useState<SessionSnapshot | null>(null);
  const [departmentId, setDepartmentId] = useState("");
  const [nickname, setNickname] = useState("");
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const sessionRef = useRef<SessionSnapshot | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    const check = async () => {
      if (sessionRef.current || result) return;
      try {
        const response = await fetch(`/api/play/${game.deviceId}/session`, {
          cache: "no-store",
        });
        const body = (await response.json()) as {
          session: SessionSnapshot | null;
        };
        if (response.ok && body.session && !sessionRef.current) {
          setSession(body.session);
        }
      } catch {
        // The ready screen remains usable if a temporary request fails.
      }
    };
    void check();
    const timer = window.setInterval(check, 1200);
    return () => window.clearInterval(timer);
  }, [game.deviceId, result]);

  useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(() => {
      setResult(null);
      setSession(null);
      sessionRef.current = null;
      setDepartmentId("");
      setNickname("");
      setError("");
    }, resetSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [result, resetSeconds]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) return;
    setError("");
    if (!departmentId) {
      setError("학과를 선택해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`/api/sessions/${session.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department_id: departmentId,
          nickname,
        }),
      });
      const body = (await response.json()) as {
        success?: boolean;
        result?: RegistrationResult;
        error?: string;
      };
      if (!response.ok || !body.result) {
        setError(body.error ?? "랭킹을 등록하지 못했습니다.");
      } else {
        setResult(body.result);
      }
    } catch {
      setError("서버에 연결할 수 없습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <section className="play-state registered-state" aria-live="polite">
        <div className="registered-burst" aria-hidden="true">✓</div>
        <h1>등록 완료</h1>
        <div className="registered-score">
          <strong>{result.nickname}</strong>
          <span>{result.departmentName}</span>
          <b>{result.score}<small>점</small></b>
        </div>
        <div className="registered-ranks">
          <div><span>게임 개인 순위</span><strong>{result.playerRank}위</strong></div>
          <div><span>학과 종합 순위</span><strong>{result.departmentRank}위</strong></div>
        </div>
        <p className="reset-message">
          {resetSeconds}초 후 준비 화면으로 돌아갑니다.
        </p>
        <PressableLink href={`/games/${game.slug}`} className="pressable-dark">
          랭킹 보기
        </PressableLink>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="play-state ready-state" aria-live="polite">
        <span className="connection-status"><i aria-hidden="true" />기기 연결됨</span>
        <h1>준비 완료</h1>
        <p>게임 기기에서 플레이해주세요</p>
        <small>새 점수를 기다리고 있습니다.</small>
      </section>
    );
  }

  return (
    <section className="play-state score-state" aria-live="polite">
      <div className="score-panel">
        <span className="score-state-title">게임 종료</span>
        <strong className="score-pop">{session.score}</strong>
        <b>점</b>
        <small>게임 기기에서 전송된 점수입니다.</small>
      </div>
      <form className="player-form" onSubmit={submit}>
        <div>
          <h2>랭킹 등록</h2>
          <p>학과와 닉네임을 입력해주세요.</p>
        </div>
        <DepartmentPicker
          groups={collegeGroups}
          value={departmentId}
          onChange={setDepartmentId}
        />
        <label className="field-label" htmlFor="nickname">
          닉네임
          <input
            id="nickname"
            name="nickname"
            minLength={2}
            maxLength={12}
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="2~12자 닉네임"
            autoComplete="off"
            required
          />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button
          className="pressable-button pressable-orange pressable-full"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "등록 중..." : "랭킹 등록"}
        </button>
      </form>
    </section>
  );
}
