"use client";

import { useEffect, useState } from "react";
import { departments } from "@/data/departments";
import { games } from "@/data/games";

type Snapshot = {
  summary: { playCount: number; champion: string };
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

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setSnapshot(null);
    setSuccess("");
  };

  if (loading) return <div className="admin-loading">관리자 정보를 확인하고 있습니다.</div>;

  if (!snapshot) {
    return (
      <form className="admin-login" onSubmit={login}>
        <h2>관리자 인증</h2>
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
            <div>{games.map((game) => <button type="button" aria-pressed={manualScore.gameId === game.id} onClick={() => setManualScore((current) => ({ ...current, gameId: game.id }))} key={game.id}><strong>{game.name}</strong></button>)}</div>
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
    </div>
  );
}
