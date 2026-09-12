"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { departments } from "@/data/departments";
import { games } from "@/data/games";
import type { AdminSnapshot } from "@/lib/admin-snapshot";
import type { AdminScoreRecord } from "@/lib/types";

type ParticipantLookupState = "idle" | "loading" | "new" | "found" | "error";

type ManualScoreResponse = {
  error?: string;
  status?: "created" | "updated" | "kept";
  previousScore?: number | null;
  score?: { score: number };
};

type EditForm = {
  id: string;
  gameId: string;
  departmentId: string;
  nickname: string;
  score: string;
};

const activeDepartments = departments.filter(({ isActive }) => isActive);

function getGameName(gameId: string) {
  return games.find(({ id }) => id === gameId)?.name ?? gameId;
}

function isTeamGame(gameId: string) {
  return games.find(({ id }) => id === gameId)?.rankingMode === "team";
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

function formatPhone(value: string | null) {
  if (!value) return "미등록";
  if (value.length === 11) return value.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  return value.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
}

function getRecordIdentifier(record: AdminScoreRecord) {
  return formatPhone(record.participantPhone);
}

export function AdminConsole({
  initialSnapshot,
}: {
  initialSnapshot: AdminSnapshot | null;
}) {
  const [password, setPassword] = useState("");
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(initialSnapshot);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyScoreId, setBusyScoreId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [participantLookup, setParticipantLookup] = useState<ParticipantLookupState>("idle");
  const identifierRef = useRef<HTMLInputElement>(null);
  const departmentRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const teamNameRef = useRef<HTMLInputElement>(null);
  const scoreRef = useRef<HTMLInputElement>(null);
  const [manualScore, setManualScore] = useState({
    gameId: games[0]?.id ?? "",
    departmentId: activeDepartments[0]?.id ?? "",
    phone: "",
    nickname: "",
    teamName: "",
    score: "",
  });
  const [departmentQuery, setDepartmentQuery] = useState(
    getDepartmentName(activeDepartments[0]?.id ?? ""),
  );

  const selectedGame = games.find(({ id }) => id === manualScore.gameId) ?? games[0];
  const selectedGameIsTeam = selectedGame?.rankingMode === "team";
  const matchingDepartments = useMemo(() => {
    const query = departmentQuery.trim().toLocaleLowerCase("ko");
    if (!query) return activeDepartments;
    return activeDepartments.filter(({ name }) =>
      name.toLocaleLowerCase("ko").includes(query),
    );
  }, [departmentQuery]);

  const selectDepartment = useCallback((departmentId: string) => {
    const department = activeDepartments.find(({ id }) => id === departmentId);
    if (!department) return;
    setDepartmentQuery(department.name);
    setManualScore((current) => ({ ...current, departmentId }));
  }, []);

  const focusDepartment = () => {
    window.setTimeout(() => {
      departmentRef.current?.focus();
      departmentRef.current?.select();
    }, 0);
  };

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/snapshot", { cache: "no-store" });
      const body = (await response.json()) as AdminSnapshot & { error?: string };
      if (response.ok) {
        setSnapshot(body);
        return;
      }

      if (response.status === 401) {
        setSnapshot(null);
      } else {
        setError(body.error ?? "관리자 정보를 불러오지 못했습니다.");
      }
    } catch {
      setError("관리자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  }, []);

  const hasSnapshot = snapshot !== null;

  useEffect(() => {
    if (!hasSnapshot) return;

    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [hasSnapshot, load]);

  useEffect(() => {
    const phone = manualScore.phone;
    if (phone.length < 10) return;
    const participantKind = selectedGameIsTeam ? "team" : "individual";

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setParticipantLookup("loading");
      try {
        const response = await fetch(
          `/api/admin/participants/${phone}?kind=${participantKind}`,
          {
          cache: "no-store",
          signal: controller.signal,
          },
        );
        const body = (await response.json()) as {
          found?: boolean;
          participant?: { displayName: string; departmentId: string };
        };
        if (!response.ok) {
          if (response.status === 401) setSnapshot(null);
          setParticipantLookup("error");
          return;
        }
        if (body.found && body.participant) {
          setManualScore((current) =>
            current.phone === phone
              ? {
                  ...current,
                  nickname: selectedGameIsTeam
                    ? current.nickname
                    : body.participant?.displayName ?? "",
                  teamName: selectedGameIsTeam
                    ? body.participant?.displayName ?? ""
                    : current.teamName,
                  departmentId: body.participant?.departmentId ?? current.departmentId,
                }
              : current,
          );
          setParticipantLookup("found");
          setDepartmentQuery(getDepartmentName(body.participant.departmentId));
        } else {
          setParticipantLookup("new");
        }
      } catch (lookupError) {
        if ((lookupError as Error).name !== "AbortError") setParticipantLookup("error");
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [manualScore.phone, selectedGameIsTeam]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
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
    } catch {
      setError("로그인 요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
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
          phone: manualScore.phone,
          nickname: selectedGameIsTeam ? manualScore.teamName : manualScore.nickname,
          team_name: selectedGameIsTeam ? manualScore.teamName : null,
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
        const displayName = selectedGameIsTeam ? manualScore.teamName : manualScore.nickname;
        setSuccess(`${displayName} ${selectedGameIsTeam ? "팀의" : "참가자의"} ${body.score?.score}점을 등록했습니다.`);
      }

      setManualScore((current) => ({
        ...current,
        phone: "",
        nickname: "",
        teamName: "",
        score: "",
      }));
      setParticipantLookup("idle");
      await load();
      window.setTimeout(() => identifierRef.current?.focus(), 0);
    } catch {
      setError("점수 등록 요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const beginEdit = (record: AdminScoreRecord) => {
    setError("");
    setSuccess("");
    setEditForm({
      id: record.id,
      gameId: record.gameId,
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
          game_id: editForm.gameId,
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
      setSuccess("점수 기록을 수정했습니다.");
      await load();
    } catch {
      setError("점수 수정 요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusyScoreId(null);
    }
  };

  const removeScore = async (record: AdminScoreRecord) => {
    const confirmed = window.confirm(
      `${getRecordIdentifier(record)} · ${getGameName(record.gameId)} 점수 기록을 순위에서 제외할까요? 같은 참가자와 게임을 다시 등록하면 복원됩니다.`,
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
      setSuccess("선택한 점수를 순위에서 제외했습니다. 같은 전화번호와 게임을 다시 등록하면 복원됩니다.");
      await load();
    } catch {
      setError("점수 삭제 요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusyScoreId(null);
    }
  };

  const logout = async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("logout failed");
      setSnapshot(null);
      setSuccess("");
    } catch {
      setError("로그아웃 요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  if (!snapshot) {
    return (
      <form className="admin-login" onSubmit={login}>
        <h2>관리자 인증</h2>
        <label htmlFor="admin-password">
          비밀번호
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="pressable-button pressable-orange" type="submit">
          관리 화면 열기
        </button>
      </form>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-toolbar">
        <span>관리자로 로그인됨</span>
        <button type="button" className="text-button" onClick={logout}>
          로그아웃
        </button>
      </div>

      <p className={snapshot.sync.state === "error" ? "form-error" : "form-success"} role="status">
        {snapshot.sync.mode === "mock" && "샘플 점수 저장소를 사용 중입니다."}
        {snapshot.sync.state === "ready" && `Supabase 연결됨 · 게임별 최고 점수 ${snapshot.sync.totalRows}개`}
        {snapshot.sync.state === "error" && `Supabase 연결 오류${snapshot.sync.error ? ` · ${snapshot.sync.error}` : ""}`}
      </p>

      <div className="admin-summary">
        <div>
          <span>등록된 기록</span>
          <strong>{snapshot.summary.playCount}</strong>
        </div>
        <div>
          <span>현재 1위 학과</span>
          <strong>{snapshot.summary.champion}</strong>
        </div>
      </div>

      <section className="admin-score-entry">
        <div className="admin-score-heading">
          <h2>점수 직접 등록</h2>
          <p>
            {selectedGameIsTeam
              ? "대표자 전화번호로 팀을 확인하고, 해당 팀의 팀게임 3개를 합산합니다."
              : "전화번호로 개인을 확인하고, 개인게임 2개의 최고 점수를 합산합니다."}
          </p>
        </div>

        <form onSubmit={submitManualScore}>
          <fieldset className="admin-game-picker">
            <legend>게임 선택</legend>
            <div>
              {games.map((game) => (
                <button
                  type="button"
                  aria-pressed={manualScore.gameId === game.id}
                  onClick={() => {
                    setParticipantLookup("idle");
                    setManualScore((current) => ({
                      ...current,
                      gameId: game.id,
                      phone: "",
                      nickname: "",
                      teamName: "",
                      score: "",
                    }));
                    setDepartmentQuery(getDepartmentName(activeDepartments[0]?.id ?? ""));
                    window.setTimeout(() => identifierRef.current?.focus(), 0);
                  }}
                  key={game.id}
                >
                  <strong>{game.name}</strong>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="admin-score-fields">
            <label>
              {selectedGameIsTeam ? "대표자 전화번호" : "전화번호"}
              <input
                ref={identifierRef}
                type="text"
                inputMode="tel"
                autoComplete="tel"
                placeholder="01012345678"
                minLength={10}
                maxLength={11}
                pattern="01[016789][0-9]{7,8}"
                value={manualScore.phone}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, "").slice(0, 11);
                  setParticipantLookup("idle");
                  setManualScore((current) => ({
                    ...current,
                    phone: digits,
                    nickname: selectedGameIsTeam || digits === current.phone ? current.nickname : "",
                    teamName: selectedGameIsTeam && digits !== current.phone ? "" : current.teamName,
                  }));
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  focusDepartment();
                }}
                required
              />
            </label>

            <label className="admin-department-combobox">
              학과
              <input
                ref={departmentRef}
                type="text"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={matchingDepartments.length > 0 && departmentQuery !== getDepartmentName(manualScore.departmentId)}
                aria-controls="admin-department-options"
                autoComplete="off"
                placeholder="학과명을 한글로 입력"
                value={departmentQuery}
                onChange={(event) => {
                  const query = event.target.value;
                  setDepartmentQuery(query);
                  const exact = activeDepartments.find(({ name }) => name === query.trim());
                  if (exact) {
                    setManualScore((current) => ({ ...current, departmentId: exact.id }));
                  }
                }}
                onFocus={(event) => event.currentTarget.select()}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  const selected = matchingDepartments[0];
                  if (!selected) {
                    setError("입력한 학과를 찾을 수 없습니다.");
                    return;
                  }
                  selectDepartment(selected.id);
                  window.setTimeout(
                    () => (selectedGameIsTeam ? teamNameRef.current : nicknameRef.current)?.focus(),
                    0,
                  );
                }}
                required
              />
              {matchingDepartments.length > 0 &&
                departmentQuery !== getDepartmentName(manualScore.departmentId) && (
                  <span id="admin-department-options" className="admin-department-options" role="listbox">
                    {matchingDepartments.slice(0, 6).map((department) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={department.id === manualScore.departmentId}
                        key={department.id}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          selectDepartment(department.id);
                          (selectedGameIsTeam ? teamNameRef.current : nicknameRef.current)?.focus();
                        }}
                      >
                        {department.name}
                      </button>
                    ))}
                  </span>
                )}
            </label>

            {selectedGameIsTeam ? (
              <label>
                팀명
                <input
                  ref={teamNameRef}
                  type="text"
                  autoComplete="off"
                  minLength={2}
                  maxLength={12}
                  placeholder="2~12자"
                  value={manualScore.teamName}
                  onChange={(event) =>
                    setManualScore((current) => ({ ...current, teamName: event.target.value }))
                  }
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    scoreRef.current?.focus();
                  }}
                  required
                />
              </label>
            ) : (
              <label>
                닉네임
                <input
                  ref={nicknameRef}
                  type="text"
                  autoComplete="off"
                  minLength={2}
                  maxLength={12}
                  placeholder="2~12자"
                  value={manualScore.nickname}
                  onChange={(event) =>
                    setManualScore((current) => ({ ...current, nickname: event.target.value }))
                  }
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    scoreRef.current?.focus();
                  }}
                  required
                />
              </label>
            )}

            <label>
              점수
              <input
                ref={scoreRef}
                type="number"
                min={0}
                max={selectedGame?.maxScore ?? 9999}
                step={1}
                placeholder={`0~${selectedGame?.maxScore ?? 9999}`}
                value={manualScore.score}
                onChange={(event) =>
                  setManualScore((current) => ({ ...current, score: event.target.value }))
                }
                required
              />
            </label>
          </div>

          <div className="admin-lookup-slot" aria-live="polite">
            {participantLookup === "loading" && (
              <p className="form-info-inline" role="status">
                ⏳ 전화번호를 조회하고 있습니다...
              </p>
            )}
            {participantLookup === "found" && (
              <p className="form-success-inline" role="status">
                ✓ 기존 {selectedGameIsTeam ? "팀" : "참가자"}입니다. 이름과 학과를 자동으로 불러왔습니다.
              </p>
            )}
            {participantLookup === "new" && (
              <p className="form-info-inline" role="status">
                ℹ 처음 등록하는 전화번호입니다. 학과와 {selectedGameIsTeam ? "팀명" : "닉네임"}을 입력해주세요.
              </p>
            )}
            {participantLookup === "error" && (
              <p className="form-error-inline" role="alert">
                ✕ 전화번호 조회에 실패했습니다. 잠시 후 다시 입력해주세요.
              </p>
            )}
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          {success && <p className="form-success" role="status">{success}</p>}

          <button
            className="pressable-button pressable-orange admin-score-submit"
            type="submit"
            disabled={submitting || participantLookup === "loading"}
          >
            {submitting ? "등록 중" : "점수 등록"}
          </button>
        </form>
      </section>

      <section className="admin-records" aria-labelledby="admin-records-title">
        <div className="admin-section-title">
          <div>
            <h2 id="admin-records-title">등록 점수 관리</h2>
          </div>
          <p>최근 수정 순 · 총 {snapshot.records.length}건</p>
        </div>
        <p className="admin-records-note">
          개인과 팀 모두 전화번호로 관리합니다. 학과와 이름 수정은 해당 개인 또는 팀의 모든 기록에 반영됩니다.
        </p>

        {snapshot.records.length === 0 ? (
          <div className="admin-empty-state">
            <strong>아직 등록된 점수가 없습니다.</strong>
            <p>위 입력 폼에서 첫 점수를 등록하면 이곳에 수정·삭제 목록이 표시됩니다.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>게임</th>
                    <th>전화번호</th>
                    <th>닉네임/팀명</th>
                    <th>학과</th>
                    <th>점수</th>
                    <th>수정 시각</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.records.map((record) => {
                    const editing = editForm?.id === record.id;
                    return (
                      <tr key={record.id}>
                        <td>
                          <strong>{getGameName(record.gameId)}</strong>
                        </td>
                        <td>{getRecordIdentifier(record)}</td>
                        <td>
                          {editing ? (
                            <input
                              aria-label={isTeamGame(record.gameId) ? "팀명 수정" : "닉네임 수정"}
                              type="text"
                              minLength={2}
                              maxLength={12}
                              value={editForm.nickname}
                              onChange={(event) =>
                                setEditForm({ ...editForm, nickname: event.target.value })
                              }
                              form={`edit-score-${record.id}`}
                            />
                          ) : (
                            <span className="admin-record-display-name">
                              {record.nickname}
                            </span>
                          )}
                        </td>
                        <td>
                          {editing ? (
                            <select
                              aria-label="학과 수정"
                              value={editForm.departmentId}
                              onChange={(event) =>
                                setEditForm({ ...editForm, departmentId: event.target.value })
                              }
                              form={`edit-score-${record.id}`}
                            >
                              {activeDepartments.map((department) => (
                                <option value={department.id} key={department.id}>
                                  {department.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            getDepartmentName(record.departmentId)
                          )}
                        </td>
                        <td>
                          {editing ? (
                            <input
                              aria-label="점수 수정"
                              type="number"
                              min={0}
                              max={9999}
                              step={1}
                              value={editForm.score}
                              onChange={(event) =>
                                setEditForm({ ...editForm, score: event.target.value })
                              }
                              form={`edit-score-${record.id}`}
                            />
                          ) : (
                            record.score.toLocaleString("ko-KR")
                          )}
                        </td>
                        <td>{formatUpdatedAt(record.createdAt)}</td>
                        <td>
                          {editing ? (
                            <form
                              id={`edit-score-${record.id}`}
                              className="admin-record-actions"
                              onSubmit={saveEdit}
                            >
                              <button
                                type="submit"
                                className="admin-save-button"
                                disabled={busyScoreId === record.id}
                              >
                                {busyScoreId === record.id ? "저장 중" : "저장"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditForm(null)}
                                disabled={busyScoreId === record.id}
                              >
                                취소
                              </button>
                            </form>
                          ) : (
                            <div className="admin-record-actions">
                              <button
                                type="button"
                                className="admin-edit-button"
                                onClick={() => beginEdit(record)}
                                disabled={busyScoreId !== null}
                              >
                                수정
                              </button>
                              <button
                                type="button"
                                className="admin-delete-button"
                                onClick={() => void removeScore(record)}
                                disabled={busyScoreId !== null}
                              >
                                {busyScoreId === record.id ? "삭제 중" : "삭제"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="admin-mobile-cards" aria-label="등록 점수 모바일 목록">
              {snapshot.records.map((record) => {
                const editing = editForm?.id === record.id;
                return (
                  <div className="admin-record-card" key={record.id}>
                    <div className="admin-record-card-header">
                      <strong className="admin-record-game-name">{getGameName(record.gameId)}</strong>
                      <b className="admin-record-score">
                        {editing ? "수정 중" : `${record.score.toLocaleString("ko-KR")}점`}
                      </b>
                    </div>

                    {editing ? (
                      <form className="admin-mobile-edit-form" onSubmit={saveEdit}>
                        <label>
                          닉네임 / 팀명
                          <input
                            type="text"
                            minLength={2}
                            maxLength={12}
                            value={editForm.nickname}
                            onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                            required
                          />
                        </label>
                        <label>
                          학과
                          <select
                            value={editForm.departmentId}
                            onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                            required
                          >
                            {activeDepartments.map((d) => (
                              <option value={d.id} key={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          점수
                          <input
                            type="number"
                            min={0}
                            max={9999}
                            step={1}
                            value={editForm.score}
                            onChange={(e) => setEditForm({ ...editForm, score: e.target.value })}
                            required
                          />
                        </label>
                        <div className="admin-record-actions">
                          <button
                            type="submit"
                            className="admin-save-button"
                            disabled={busyScoreId === record.id}
                          >
                            {busyScoreId === record.id ? "저장 중" : "저장"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditForm(null)}
                            disabled={busyScoreId === record.id}
                          >
                            취소
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="admin-record-card-meta">
                          <div>
                            <span>{record.participantKind === "team" ? "대표자 전화번호: " : "전화번호: "}</span>
                            <strong>{getRecordIdentifier(record)}</strong>
                          </div>
                          <div>
                            <span>{isTeamGame(record.gameId) ? "팀명: " : "닉네임: "}</span>
                            <strong>{record.nickname}</strong>
                          </div>
                          <div>
                            <span>학과: </span>
                            <strong>{getDepartmentName(record.departmentId)}</strong>
                          </div>
                          <div className="admin-record-time">
                            <span>수정 시각: </span>
                            <strong>{formatUpdatedAt(record.createdAt)}</strong>
                          </div>
                        </div>
                        <div className="admin-record-actions">
                          <button
                            type="button"
                            className="admin-edit-button"
                            onClick={() => beginEdit(record)}
                            disabled={busyScoreId !== null}
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            className="admin-delete-button"
                            onClick={() => void removeScore(record)}
                            disabled={busyScoreId !== null}
                          >
                            {busyScoreId === record.id ? "삭제 중" : "삭제"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
