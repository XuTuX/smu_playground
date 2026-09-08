"use client";

import { useEffect, useState } from "react";
import { departments } from "@/data/departments";
import { games } from "@/data/games";
import type { AdminScoreRecord } from "@/lib/types";

type Snapshot = {
  summary: { playCount: number; champion: string };
  sync: {
    mode: "mock" | "supabase";
    state: "mock" | "ready" | "error";
    totalRows: number;
    error: string | null;
  };
  records: AdminScoreRecord[];
};

type StudentLookupState = "idle" | "loading" | "new" | "found" | "error";

type ManualScoreResponse = {
  error?: string;
  status?: "created" | "updated" | "kept";
  previousScore?: number | null;
  score?: { score: number };
};

type EditForm = {
  id: string;
  departmentId: string;
  nickname: string;
  score: string;
};

const activeDepartments = departments.filter(({ isActive }) => isActive);

function getGameName(gameId: string) {
  return games.find(({ id }) => id === gameId)?.name ?? gameId;
}

function getDepartmentName(departmentId: string) {
  return departments.find(({ id }) => id === departmentId)?.name ?? departmentId;
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminConsole() {
  const [password, setPassword] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyScoreId, setBusyScoreId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [studentLookup, setStudentLookup] = useState<StudentLookupState>("idle");
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

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const studentId = manualScore.studentId;
    if (studentId.length < 6) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setStudentLookup("loading");
      try {
        const response = await fetch(`/api/admin/students/${studentId}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = (await response.json()) as {
          found?: boolean;
          student?: { nickname: string; departmentId: string };
        };
        if (!response.ok) {
          if (response.status === 401) setSnapshot(null);
          setStudentLookup("error");
          return;
        }
        if (body.found && body.student) {
          setManualScore((current) =>
            current.studentId === studentId
              ? {
                  ...current,
                  nickname: body.student?.nickname ?? "",
                  departmentId: body.student?.departmentId ?? current.departmentId,
                }
              : current,
          );
          setStudentLookup("found");
        } else {
          setStudentLookup("new");
        }
      } catch (lookupError) {
        if ((lookupError as Error).name !== "AbortError") setStudentLookup("error");
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [manualScore.studentId]);

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
      setStudentLookup("idle");
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const beginEdit = (record: AdminScoreRecord) => {
    setError("");
    setSuccess("");
    setEditForm({
      id: record.id,
      departmentId: record.departmentId,
      nickname: record.nickname,
      score: String(record.score),
    });
  };

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editForm) return;

    setError("");
    setSuccess("");
    setBusyScoreId(editForm.id);
    try {
      const response = await fetch(`/api/admin/scores/${editForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department_id: editForm.departmentId,
          nickname: editForm.nickname,
          score: Number(editForm.score),
        }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        if (response.status === 401) setSnapshot(null);
        setError(body.error ?? "점수를 수정하지 못했습니다.");
        return;
      }

      setEditForm(null);
      setSuccess("점수 기록과 학생 정보를 수정했습니다.");
      await load();
    } finally {
      setBusyScoreId(null);
    }
  };

  const removeScore = async (record: AdminScoreRecord) => {
    const confirmed = window.confirm(
      `${record.studentNumber} · ${getGameName(record.gameId)} 점수 기록을 삭제할까요?`,
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");
    setBusyScoreId(record.id);
    try {
      const response = await fetch(`/api/admin/scores/${record.id}`, {
        method: "DELETE",
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        if (response.status === 401) setSnapshot(null);
        setError(body.error ?? "점수를 삭제하지 못했습니다.");
        return;
      }

      if (editForm?.id === record.id) setEditForm(null);
      setSuccess("선택한 게임 점수만 삭제했습니다. 학생 정보는 유지됩니다.");
      await load();
    } finally {
      setBusyScoreId(null);
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
      <p className={snapshot.sync.state === "error" ? "form-error" : "form-success"} role="status">
        {snapshot.sync.mode === "mock" && "개발용 mock 점수 저장소를 사용 중입니다."}
        {snapshot.sync.state === "ready" && `Supabase 연결됨 · 게임별 최고 점수 ${snapshot.sync.totalRows}개`}
        {snapshot.sync.state === "error" && `Supabase 연결 오류${snapshot.sync.error ? ` · ${snapshot.sync.error}` : ""}`}
      </p>
      <div className="admin-summary"><div><span>등록된 기록</span><strong>{snapshot.summary.playCount}</strong></div><div><span>현재 1위 학과</span><strong>{snapshot.summary.champion}</strong></div></div>

      <section className="admin-score-entry">
        <div className="admin-score-heading"><h2>점수 직접 등록</h2><p>같은 학번과 게임은 가장 높은 점수 하나만 순위에 반영됩니다.</p></div>
        <form onSubmit={submitManualScore}>
          <fieldset className="admin-game-picker">
            <legend>게임 선택</legend>
            <div>{games.map((game) => <button type="button" aria-pressed={manualScore.gameId === game.id} onClick={() => setManualScore((current) => ({ ...current, gameId: game.id }))} key={game.id}><strong>{game.name}</strong></button>)}</div>
          </fieldset>
          <div className="admin-score-fields">
            <label>학번<input type="text" inputMode="numeric" autoComplete="off" placeholder="숫자 6~12자리" value={manualScore.studentId} onChange={(event) => {
              const studentId = event.target.value.replace(/\D/g, "").slice(0, 12);
              setStudentLookup("idle");
              setManualScore((current) => ({
                ...current,
                studentId,
                nickname: studentId === current.studentId ? current.nickname : "",
                departmentId: studentId === current.studentId ? current.departmentId : (activeDepartments[0]?.id ?? ""),
              }));
            }} required /></label>
            <label>학과<select value={manualScore.departmentId} onChange={(event) => setManualScore((current) => ({ ...current, departmentId: event.target.value }))} disabled={studentLookup === "found"} required>{activeDepartments.map((department) => <option value={department.id} key={department.id}>{department.name}</option>)}</select></label>
            <label>닉네임<input type="text" autoComplete="off" minLength={2} maxLength={12} placeholder="2~12자" value={manualScore.nickname} onChange={(event) => setManualScore((current) => ({ ...current, nickname: event.target.value }))} readOnly={studentLookup === "found"} required /></label>
            <label>점수<input type="number" min={0} max={selectedGame?.maxScore ?? 9999} step={1} placeholder={`0~${selectedGame?.maxScore ?? 9999}`} value={manualScore.score} onChange={(event) => setManualScore((current) => ({ ...current, score: event.target.value }))} required /></label>
          </div>
          {studentLookup === "loading" && <p className="form-success" role="status">학번을 확인하는 중입니다.</p>}
          {studentLookup === "found" && <p className="form-success" role="status">기존 학생입니다. 닉네임과 학과를 자동으로 불러왔습니다.</p>}
          {studentLookup === "new" && <p className="form-success" role="status">처음 등록하는 학번입니다. 학과와 닉네임을 입력해주세요.</p>}
          {studentLookup === "error" && <p className="form-error" role="alert">학번 조회에 실패했습니다. 잠시 후 다시 입력해주세요.</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {success && <p className="form-success" role="status">{success}</p>}
          <button className="pressable-button pressable-orange admin-score-submit" type="submit" disabled={submitting || studentLookup === "loading"}>{submitting ? "등록 중" : "점수 등록"}</button>
        </form>
      </section>

      <section className="admin-records" aria-labelledby="admin-records-title">
        <div className="admin-section-title">
          <div><p className="mono-label">SCORE RECORDS</p><h2 id="admin-records-title">등록 점수 관리</h2></div>
          <p>최근 수정 순 · 총 {snapshot.records.length}건</p>
        </div>
        <p className="admin-records-note">닉네임·학과 수정은 같은 학번의 모든 게임 기록에 반영됩니다. 삭제는 선택한 게임 점수만 처리합니다.</p>

        {snapshot.records.length === 0 ? (
          <div className="admin-empty-state">
            <strong>아직 등록된 점수가 없습니다.</strong>
            <p>위 입력 폼에서 첫 점수를 등록하면 이곳에 수정·삭제 목록이 표시됩니다.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead><tr><th>게임</th><th>학번</th><th>닉네임</th><th>학과</th><th>점수</th><th>수정 시각</th><th>관리</th></tr></thead>
              <tbody>
                {snapshot.records.map((record) => {
                  const editing = editForm?.id === record.id;
                  return (
                    <tr key={record.id}>
                      <td><strong>{getGameName(record.gameId)}</strong></td>
                      <td>{record.studentNumber}</td>
                      <td>{editing ? <input aria-label="닉네임 수정" type="text" minLength={2} maxLength={12} value={editForm.nickname} onChange={(event) => setEditForm({ ...editForm, nickname: event.target.value })} form={`edit-score-${record.id}`} /> : record.nickname}</td>
                      <td>{editing ? <select aria-label="학과 수정" value={editForm.departmentId} onChange={(event) => setEditForm({ ...editForm, departmentId: event.target.value })} form={`edit-score-${record.id}`}>{activeDepartments.map((department) => <option value={department.id} key={department.id}>{department.name}</option>)}</select> : getDepartmentName(record.departmentId)}</td>
                      <td>{editing ? <input aria-label="점수 수정" type="number" min={0} max={9999} step={1} value={editForm.score} onChange={(event) => setEditForm({ ...editForm, score: event.target.value })} form={`edit-score-${record.id}`} /> : record.score.toLocaleString("ko-KR")}</td>
                      <td>{formatUpdatedAt(record.createdAt)}</td>
                      <td>
                        {editing ? (
                          <form id={`edit-score-${record.id}`} className="admin-record-actions" onSubmit={saveEdit}>
                            <button type="submit" className="admin-save-button" disabled={busyScoreId === record.id}>{busyScoreId === record.id ? "저장 중" : "저장"}</button>
                            <button type="button" onClick={() => setEditForm(null)} disabled={busyScoreId === record.id}>취소</button>
                          </form>
                        ) : (
                          <div className="admin-record-actions">
                            <button type="button" className="admin-edit-button" onClick={() => beginEdit(record)} disabled={busyScoreId !== null}>수정</button>
                            <button type="button" className="admin-delete-button" onClick={() => void removeScore(record)} disabled={busyScoreId !== null}>{busyScoreId === record.id ? "삭제 중" : "삭제"}</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
