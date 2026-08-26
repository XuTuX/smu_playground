"use client";

import { useEffect, useState } from "react";
import { PressableLink } from "@/components/ui/PressableLink";
import { departments } from "@/data/departments";
import { games } from "@/data/games";
import type { GameSession } from "@/lib/types";

type Snapshot = {
  summary: { playCount: number; champion: string };
  sessions: GameSession[];
};

type ManualScoreResponse = {
  error?: string;
  status?: "created" | "updated" | "kept";
  previousScore?: number | null;
  score?: { score: number };
};

const activeDepartments = departments.filter(({ isActive }) => isActive);

export function AdminConsole() {
  const [password, setPassword] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [manualScore, setManualScore] = useState({
    gameId: games[0]?.id ?? "",
    departmentId: activeDepartments[0]?.id ?? "",
    studentId: "",
    nickname: "",
    score: "",
  });

  const selectedGame = games.find(({ id }) => id === manualScore.gameId) ?? games[0];

  const load = async () => {
    try {
      const response = await fetch("/api/admin/snapshot", { cache: "no-store" });
      if (response.ok) setSnapshot((await response.json()) as Snapshot);
      else setSnapshot(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) setError(body.error ?? "로그인 실패");
    else {
      setPassword("");
      await load();
    }
  };

  const submitManualScore = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: manualScore.gameId,
          department_id: manualScore.departmentId,
          student_id: manualScore.studentId,
          nickname: manualScore.nickname,
          score: Number(manualScore.score),
        }),
      });
      const body = (await response.json()) as ManualScoreResponse;

      if (!response.ok) {
        if (response.status === 401) setSnapshot(null);
        setError(body.error ?? "점수를 등록하지 못했습니다.");
        return;
      }

      if (body.status === "updated") {
        setSuccess(`기존 최고 점수 ${body.previousScore}점에서 ${body.score?.score}점으로 갱신했습니다.`);
      } else if (body.status === "kept") {
        setSuccess(`기존 최고 점수 ${body.previousScore}점이 더 높아 순위는 그대로 유지됩니다.`);
      } else {
        setSuccess(`${manualScore.nickname} 학생의 ${body.score?.score}점을 등록했습니다.`);
      }

      setManualScore((current) => ({ ...current, studentId: "", nickname: "", score: "" }));
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const action = async (name: "reset" | "expire_session", sessionId?: string) => {
    if (name === "reset" && !window.confirm("개발 중 생성된 행사 세션과 점수를 초기화할까요?")) return;
    setError("");
    const response = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: name, sessionId }),
    });
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "작업 실패");
    }
    await load();
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setSnapshot(null);
    setSuccess("");
  };

  const statusLabel = (status: GameSession["status"]) => status === "pending" ? "대기" : status === "registered" ? "등록 완료" : "만료";

  if (loading) return <div className="admin-loading">관리자 정보를 확인하고 있습니다.</div>;

  if (!snapshot) {
    return (
      <form className="admin-login" onSubmit={login}>
        <h2>관리자 인증</h2>
        <p>운영자 비밀번호를 입력해주세요. 개발 환경 기본값은 <code>playground</code>입니다.</p>
        <label htmlFor="admin-password">비밀번호<input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="pressable-button pressable-orange" type="submit">관리 화면 열기</button>
      </form>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-toolbar"><span>관리자로 로그인됨</span><button type="button" className="text-button" onClick={logout}>로그아웃</button></div>
      <div className="admin-summary"><div><span>등록된 기록</span><strong>{snapshot.summary.playCount}</strong></div><div><span>현재 1위 학과</span><strong>{snapshot.summary.champion}</strong></div></div>

      <section className="admin-score-entry">
        <div className="admin-score-heading"><h2>점수 직접 등록</h2><p>같은 학번과 게임은 가장 높은 점수 하나만 순위에 반영됩니다.</p></div>
        <form onSubmit={submitManualScore}>
          <fieldset className="admin-game-picker">
            <legend>게임 선택</legend>
            <div>{games.map((game) => <button type="button" aria-pressed={manualScore.gameId === game.id} onClick={() => setManualScore((current) => ({ ...current, gameId: game.id }))} key={game.id}><span>{game.code.replace("GAME ", "게임 ")}</span><strong>{game.name}</strong></button>)}</div>
          </fieldset>
          <div className="admin-score-fields">
            <label>학과<select value={manualScore.departmentId} onChange={(event) => setManualScore((current) => ({ ...current, departmentId: event.target.value }))} required>{activeDepartments.map((department) => <option value={department.id} key={department.id}>{department.name}</option>)}</select></label>
            <label>학번<input type="text" inputMode="numeric" autoComplete="off" placeholder="숫자 6~12자리" value={manualScore.studentId} onChange={(event) => setManualScore((current) => ({ ...current, studentId: event.target.value.replace(/\D/g, "").slice(0, 12) }))} required /></label>
            <label>닉네임<input type="text" autoComplete="off" minLength={2} maxLength={12} placeholder="2~12자" value={manualScore.nickname} onChange={(event) => setManualScore((current) => ({ ...current, nickname: event.target.value }))} required /></label>
            <label>점수<input type="number" min={0} max={selectedGame?.maxScore ?? 999} step={1} placeholder={`0~${selectedGame?.maxScore ?? 999}`} value={manualScore.score} onChange={(event) => setManualScore((current) => ({ ...current, score: event.target.value }))} required /></label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          {success && <p className="form-success" role="status">{success}</p>}
          <button className="pressable-button pressable-orange admin-score-submit" type="submit" disabled={submitting}>{submitting ? "등록 중" : "점수 등록"}</button>
        </form>
      </section>

      <section className="admin-terminals"><h2>현장 기기 등록 화면</h2><p>관리자 인증이 유지되는 이 브라우저에서만 열 수 있습니다.</p><div>{games.map((game) => <PressableLink href={`/play/${game.deviceId}`} className="pressable-cream" key={game.id}>{game.code.replace("GAME ", "게임 ")}</PressableLink>)}</div></section>

      <div className="admin-section-title"><h2>게임 세션</h2><button className="pressable-button pressable-orange" type="button" onClick={() => action("reset")}>행사 데이터 초기화</button></div>
      <div className="admin-table-wrap"><table><thead><tr><th>시간</th><th>기기</th><th>점수</th><th>상태</th><th>관리</th></tr></thead><tbody>{snapshot.sessions.map((session) => <tr key={session.id}><td>{new Date(session.createdAt).toLocaleTimeString("ko-KR")}</td><td>{session.deviceId}</td><td>{session.score}</td><td><span className={`session-status session-${session.status}`}>{statusLabel(session.status)}</span></td><td>{session.status === "pending" ? <button type="button" onClick={() => action("expire_session", session.id)}>만료 처리</button> : "—"}</td></tr>)}{snapshot.sessions.length === 0 && <tr><td colSpan={5}>아직 수신된 게임 세션이 없습니다.</td></tr>}</tbody></table></div>
    </div>
  );
}
