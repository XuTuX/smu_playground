"use client";

import { type KeyboardEvent, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { games } from "@/data/games";
import { getDepartmentStandings, getPlayerStandings } from "@/lib/ranking";
import type { DepartmentStanding, PlayerStanding, ScoreRecord } from "@/lib/types";

type MainDashboardProps = {
  standings: DepartmentStanding[];
  playerStandings: PlayerStanding[];
  scores: ScoreRecord[];
};

type MainTabKey = "dept-ranking" | "player-ranking";

const mainTabs: Array<{ key: MainTabKey; label: string }> = [
  { key: "dept-ranking", label: "학과 순위" },
  { key: "player-ranking", label: "개인 순위" },
];

export function MainDashboard({
  standings,
  playerStandings,
  scores,
}: MainDashboardProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: MainTabKey =
    tabParam === "player"
      ? "player-ranking"
      : "dept-ranking";
  const departmentParam = searchParams.get("dept");
  const selectedDeptId =
    activeTab === "dept-ranking" &&
    departmentParam &&
    standings.some(({ departmentId }) => departmentId === departmentParam)
      ? departmentParam
      : null;
  const gameParam = searchParams.get("game");
  const selectedGameId = games.some(({ id }) => id === gameParam)
    ? (gameParam as string)
    : (games[0]?.id ?? "");

  const navigateDashboard = (
    tab: MainTabKey,
    options: { departmentId?: string } = {},
  ) => {
    const params = new URLSearchParams();
    if (tab === "player-ranking") params.set("tab", "player");
    if (tab === "dept-ranking" && options.departmentId) {
      params.set("tab", "department");
      params.set("dept", options.departmentId);
    }

    const query = params.toString();
    window.history.pushState(null, "", query ? `/?${query}` : "/");
  };

  const navigateGame = (gameId: string) => {
    window.history.pushState(null, "", `/?game=${encodeURIComponent(gameId)}#game-rankings`);
  };

  const handleMainTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % mainTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + mainTabs.length) % mainTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = mainTabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = mainTabs[nextIndex];
    navigateDashboard(nextTab.key);
    window.requestAnimationFrame(() => {
      document.getElementById(`dashboard-tab-${nextTab.key}`)?.focus();
    });
  };

  const handleGameTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % games.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + games.length) % games.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = games.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextGame = games[nextIndex];
    navigateGame(nextGame.id);
    window.requestAnimationFrame(() => {
      document.getElementById(`game-filter-${nextGame.id}`)?.focus();
    });
  };

  // Precompute department details
  const deptDetails = useMemo(() => {
    const map = new Map<
      string,
      {
        standing: DepartmentStanding;
        topRecord: ScoreRecord | null;
        totalPlays: number;
        playerCount: number;
        gameBests: Array<{
          gameId: string;
          gameName: string;
          emoji: string;
          bestScore: number | null;
          nickname: string | null;
        }>;
      }
    >();

    for (const standing of standings) {
      const deptScores = scores.filter((s) => s.departmentId === standing.departmentId);
      const sortedByScore = [...deptScores].sort((a, b) => b.score - a.score);
      const topRecord = sortedByScore[0] ?? null;

      const gameBests = games.map((game) => {
        const gameScores = deptScores
          .filter((s) => s.gameId === game.id)
          .sort((a, b) => b.score - a.score);
        const best = gameScores[0];
        return {
          gameId: game.id,
          gameName: game.name,
          emoji: game.emoji,
          bestScore: best ? best.score : null,
          nickname: best ? best.nickname : null,
        };
      });

      map.set(standing.departmentId, {
        standing,
        topRecord,
        totalPlays: deptScores.length,
        playerCount: standing.playerCount,
        gameBests,
      });
    }

    return map;
  }, [standings, scores]);

  // Selected department details when entered
  const selectedDeptDetail = selectedDeptId ? deptDetails.get(selectedDeptId) : null;
  const selectedDeptStanding = selectedDeptDetail?.standing ?? standings.find((s) => s.departmentId === selectedDeptId);
  const selectedDeptTopRecord = selectedDeptDetail?.topRecord;
  const selectedDeptTopGame = selectedDeptTopRecord
    ? games.find((g) => g.id === selectedDeptTopRecord.gameId)
    : null;

  // Selected department participant leaderboard (누가 몇점으로 1등이고 세부 기록)
  const selectedDeptLeaderboard = useMemo(() => {
    if (!selectedDeptId) return [];
    const deptScores = scores.filter((s) => s.departmentId === selectedDeptId);

    const playerMap = new Map<
      string,
      {
        id: string;
        nickname: string;
        bestScore: number;
        bestGameName: string;
        bestByGame: Map<string, { score: number; gameName: string }>;
        playCount: number;
      }
    >();

    for (const s of deptScores) {
      const key = s.playerId || `${s.departmentId}:${s.nickname}`;
      const gameObj = games.find((g) => g.id === s.gameId);
      const gameLabel = gameObj ? `${gameObj.emoji} ${gameObj.name}` : s.gameId;

      const existing = playerMap.get(key);
      if (!existing) {
        playerMap.set(key, {
          id: key,
          nickname: s.nickname,
          bestScore: s.score,
          bestGameName: gameLabel,
          bestByGame: new Map([[s.gameId, { score: s.score, gameName: gameLabel }]]),
          playCount: 1,
        });
      } else {
        existing.playCount += 1;
        const gameBest = existing.bestByGame.get(s.gameId);
        if (!gameBest || s.score > gameBest.score) {
          existing.bestByGame.set(s.gameId, { score: s.score, gameName: gameLabel });
        }
        if (s.score > existing.bestScore) {
          existing.bestScore = s.score;
          existing.bestGameName = gameLabel;
        }
      }
    }

    return Array.from(playerMap.values())
      .map((item) => ({
        ...item,
        totalScore: Array.from(item.bestByGame.values()).reduce(
          (sum, record) => sum + record.score,
          0,
        ),
      }))
      .sort(
        (a, b) =>
          b.totalScore - a.totalScore ||
          b.bestScore - a.bestScore ||
          a.nickname.localeCompare(b.nickname, "ko"),
      )
      .map((item, idx) => ({
        id: item.id,
        nickname: item.nickname,
        bestScore: item.bestScore,
        bestGameName: item.bestGameName,
        playCount: item.playCount,
        totalScore: item.totalScore,
        rank: idx + 1,
      }));
  }, [scores, selectedDeptId]);

  const selectedGame = games.find((g) => g.id === selectedGameId) ?? games[0];
  const selectedGameScores = useMemo(
    () => scores.filter((s) => s.gameId === selectedGame.id),
    [scores, selectedGame],
  );
  const gameDeptStandings = useMemo(
    () => getDepartmentStandings(selectedGameScores).slice(0, 5),
    [selectedGameScores],
  );
  const gamePlayerStandings = useMemo(
    () => getPlayerStandings(selectedGameScores, { limit: 5 }),
    [selectedGameScores],
  );
  const gameTopRecord = gamePlayerStandings[0];

  const championDept = standings[0];
  const championPlayer = playerStandings[0];

  return (
    <div className="minimal-dashboard">
      <nav className="minimal-nav-tabs" role="tablist" aria-label="순위 모드 선택">
        {mainTabs.map((tab, index) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              type="button"
              className={`minimal-tab-btn${isActive ? " is-active" : ""}`}
              id={`dashboard-tab-${tab.key}`}
              onClick={() => navigateDashboard(tab.key)}
              onKeyDown={(event) => handleMainTabKeyDown(event, index)}
              role="tab"
              aria-controls={`dashboard-panel-${tab.key}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              key={tab.key}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ========================================================
          TAB 1: 학과 종합 순위 & 학과 클릭 시 진입하는 세부 기록
         ======================================================== */}
      {activeTab === "dept-ranking" && (
        <>
          {/* A. 학과 목록 화면 (선택된 학과가 없을 때) */}
          {!selectedDeptId && (
            <section
              className="minimal-view-panel"
              id="dashboard-panel-dept-ranking"
              role="tabpanel"
              aria-labelledby="dashboard-tab-dept-ranking"
            >
              {championDept && (
                <button
                  type="button"
                  className="minimal-hero-strip"
                  onClick={() =>
                    navigateDashboard("dept-ranking", {
                      departmentId: championDept.departmentId,
                    })
                  }
                  aria-label={`${championDept.departmentName} 세부 기록 보기`}
                >
                  <div className="strip-left">
                    <span className="strip-badge">현재 1위</span>
                    <strong className="strip-name">{championDept.departmentName}</strong>
                    {deptDetails.get(championDept.departmentId)?.topRecord && (
                      <span className="strip-sub">
                        1위: {deptDetails.get(championDept.departmentId)?.topRecord?.nickname} (
                        {deptDetails.get(championDept.departmentId)?.topRecord?.score.toLocaleString()}점)
                      </span>
                    )}
                  </div>
                  <div className="strip-right">
                    <b className="strip-score">{championDept.totalScore.toLocaleString("ko-KR")}점</b>
                    <span className="minimal-row-chevron" aria-hidden="true">›</span>
                  </div>
                </button>
              )}

              {standings.length > 1 && <div className="minimal-table-card">
                <div className="minimal-table-head">
                  <span>순위</span>
                  <span>학과명 / 학과 1위</span>
                  <span className="text-right">총점</span>
                  <span></span>
                </div>

                <div className="minimal-rows-list">
                  {standings.slice(1).map((standing) => {
                    const detail = deptDetails.get(standing.departmentId);
                    const topRecord = detail?.topRecord;

                    return (
                      <button
                        type="button"
                        className={`minimal-row-btn rank-row-${standing.rank}`}
                        onClick={() =>
                          navigateDashboard("dept-ranking", {
                            departmentId: standing.departmentId,
                          })
                        }
                        key={standing.departmentId}
                        title={`${standing.departmentName} 세부 기록 보기`}
                      >
                        <span className={`minimal-rank-num rank-${standing.rank}`}>
                          {String(standing.rank).padStart(2, "0")}
                        </span>

                        <div className="minimal-row-main">
                          <strong className="minimal-row-title">{standing.departmentName}</strong>
                          {topRecord ? (
                            <span className="minimal-row-desc">
                              1위: {topRecord.nickname} ({topRecord.score.toLocaleString()}점)
                            </span>
                          ) : (
                            <span className="minimal-row-desc">참가자 {standing.playerCount}명</span>
                          )}
                        </div>

                        <b className="minimal-row-score">
                          {standing.totalScore.toLocaleString("ko-KR")}
                          <small>점</small>
                        </b>

                        <span className="minimal-row-chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>}
            </section>
          )}

          {/* B. 학과를 눌렀을 때 들어와서 보이는 세부 기록 화면 */}
          {selectedDeptId && selectedDeptStanding && (
            <section
              className="minimal-view-panel"
              id="dashboard-panel-dept-ranking"
              role="tabpanel"
              aria-labelledby="dashboard-tab-dept-ranking"
            >
              <div className="minimal-detail-topbar">
                <button
                  type="button"
                  className="detail-back-button"
                  onClick={() => navigateDashboard("dept-ranking")}
                >
                  ← 전체 학과 순위
                </button>
              </div>

              <div className="minimal-detail-header">
                <div className="detail-head-left">
                  <span className={`minimal-rank-num rank-${selectedDeptStanding.rank}`}>
                    {String(selectedDeptStanding.rank).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="detail-head-title">{selectedDeptStanding.departmentName}</h2>
                    <p className="detail-head-meta">
                      종합 <strong>{selectedDeptStanding.rank}위</strong> · 참가자{" "}
                      <strong>{selectedDeptDetail?.playerCount ?? 0}명</strong> · 플레이{" "}
                      <strong>{selectedDeptDetail?.totalPlays ?? 0}회</strong>
                    </p>
                  </div>
                </div>
                <div className="detail-head-score">
                  <span>학과 총점</span>
                  <strong>{selectedDeptStanding.totalScore.toLocaleString("ko-KR")}점</strong>
                </div>
              </div>

              <div className="minimal-mvp-box">
                <div className="mvp-badge">
                  <span>학과 최고 기록</span>
                </div>
                {selectedDeptTopRecord ? (
                  <div className="mvp-content">
                    <div className="mvp-info">
                      <strong className="mvp-player-name">{selectedDeptTopRecord.nickname}</strong>
                      <span className="mvp-game-name">
                        {selectedDeptTopGame ? `${selectedDeptTopGame.emoji} ${selectedDeptTopGame.name}` : "미니게임"}
                      </span>
                    </div>
                    <div className="mvp-score-wrap">
                      <span className="mvp-score-num">{selectedDeptTopRecord.score.toLocaleString("ko-KR")}</span>
                      <span className="mvp-score-unit">점</span>
                    </div>
                  </div>
                ) : (
                  <p className="mvp-empty">등록된 게임 점수가 아직 없습니다.</p>
                )}
              </div>

              {selectedDeptDetail && (
                <div className="minimal-games-breakdown">
                  <h3 className="breakdown-title">게임별 학과 최고 기록</h3>
                  <div className="minimal-breakdown-grid">
                    {selectedDeptDetail.gameBests.map((item) => (
                      <div className="minimal-breakdown-card" key={item.gameId}>
                        <div className="minimal-breakdown-card-top">
                          <span className="minimal-breakdown-emoji" aria-hidden="true">{item.emoji}</span>
                          <strong className="breakdown-gamename">{item.gameName}</strong>
                        </div>
                        {item.bestScore !== null ? (
                          <div className="breakdown-card-bottom">
                            <span className="minimal-breakdown-score">{item.bestScore.toLocaleString()}점</span>
                            <span className="breakdown-nick">({item.nickname})</span>
                          </div>
                        ) : (
                          <span className="breakdown-none">기록 없음</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="minimal-dept-leaderboard">
                <h3 className="dept-leaderboard-title">
                  {selectedDeptStanding.departmentName} 참가자 순위
                </h3>
                {selectedDeptLeaderboard.length > 0 ? (
                  <div className="dept-leaderboard-list">
                    {selectedDeptLeaderboard.map((p) => (
                      <div
                        className={`dept-player-item${p.rank === 1 ? " is-first" : ""}`}
                        key={p.id}
                      >
                        <span className={`sub-rank-badge rank-${p.rank}`}>
                          {p.rank}
                        </span>
                        <div className="dept-player-info">
                          <strong className="dept-player-name">{p.nickname}</strong>
                          <span className="dept-player-game">
                            최고 단일 기록: {p.bestGameName} ({p.bestScore.toLocaleString()}점) · {p.playCount}회 참여
                          </span>
                        </div>
                        <b className="dept-player-score">
                          {p.totalScore.toLocaleString("ko-KR")}
                          <small>점</small>
                        </b>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mvp-empty">참여한 참가자 기록이 아직 없습니다.</p>
                )}
              </div>

            </section>
          )}
        </>
      )}

      {/* ========================================================
          TAB 3: 개인 실시간 순위
         ======================================================== */}
      {activeTab === "player-ranking" && (
        <section
          className="minimal-view-panel"
          id="dashboard-panel-player-ranking"
          role="tabpanel"
          aria-labelledby="dashboard-tab-player-ranking"
        >
          {championPlayer && (
            <div className="minimal-hero-strip player-strip">
              <div className="strip-left">
                <span className="strip-badge player-badge">현재 1위</span>
                <strong className="strip-name">{championPlayer.nickname}</strong>
                <span className="strip-sub">{championPlayer.departmentName}</span>
              </div>
              <div className="strip-right">
                <b className="strip-score">{championPlayer.score.toLocaleString("ko-KR")}점</b>
              </div>
            </div>
          )}

          {playerStandings.length > 1 && <div className="minimal-table-card">
            <div className="minimal-table-head player-head">
              <span>순위</span>
              <span>닉네임 / 소속 학과</span>
              <span className="text-right">점수</span>
            </div>

            <div className="minimal-rows-list">
              {playerStandings.slice(1).map((player) => {
                return (
                  <div
                    className={`minimal-row-static rank-row-${player.rank}`}
                    key={player.id}
                  >
                    <span className={`minimal-rank-num rank-${player.rank}`}>
                      {String(player.rank).padStart(2, "0")}
                    </span>

                    <div className="minimal-row-main">
                      <strong className="minimal-row-title">{player.nickname}</strong>
                      <span className="minimal-row-desc">{player.departmentName}</span>
                    </div>

                    <b className="minimal-row-score">
                      {player.score.toLocaleString("ko-KR")}
                      <small>점</small>
                    </b>
                  </div>
                );
              })}
            </div>
          </div>}
        </section>
      )}

      <section
        className="minimal-view-panel standalone-game-ranking"
        id="game-rankings"
        aria-labelledby="game-rankings-title"
      >
          <div className="standalone-section-heading">
            <h2 id="game-rankings-title">게임별 순위</h2>
          </div>

          {/* Game Selector Chips */}
          <div className="minimal-game-chips" role="tablist" aria-label="게임 선택">
            {games.map((g, index) => (
              <button
                type="button"
                className={`minimal-game-chip-btn accent-${g.accent}${g.id === selectedGameId ? " is-active" : ""}`}
                id={`game-filter-${g.id}`}
                onClick={() => navigateGame(g.id)}
                onKeyDown={(event) => handleGameTabKeyDown(event, index)}
                key={g.id}
                role="tab"
                aria-selected={g.id === selectedGameId}
                aria-controls="selected-game-panel"
                tabIndex={g.id === selectedGameId ? 0 : -1}
              >
                <span className="game-chip-name">{g.name}</span>
              </button>
            ))}
          </div>

          {/* Selected Game Header */}
          <div
            className={`minimal-game-info-card accent-${selectedGame.accent}`}
            id="selected-game-panel"
            role="tabpanel"
            aria-labelledby={`game-filter-${selectedGame.id}`}
          >
            <div className="game-info-left">
              <span className="game-info-emoji">{selectedGame.emoji}</span>
              <div>
                <div className="game-info-meta">
                  <span className="game-info-tag">
                    {selectedGame.rankingMode === "team" ? "협동 팀전" : "개인전"}
                  </span>
                  {gameTopRecord && (
                    <span className="game-info-best">
                      최고 기록: <strong>{gameTopRecord.score.toLocaleString("ko-KR")}점</strong> ({gameTopRecord.nickname} · {gameTopRecord.departmentName})
                    </span>
                  )}
                </div>
                <h2 className="game-info-title">{selectedGame.name}</h2>
                <p className="game-info-desc">{selectedGame.description}</p>
              </div>
            </div>
          </div>

          {/* 2 Columns: 학과 TOP 5 & 팀/개인 TOP 5 */}
          <div className="minimal-game-columns">
            <div className="minimal-sub-column">
              <div className="sub-column-header">
                <h3>학과 상위 5위</h3>
                <span className="sub-column-badge">합산 순위</span>
              </div>
              <div className="minimal-sub-rows">
                {gameDeptStandings.length > 0 ? (
                  gameDeptStandings.map((dept) => (
                    <div className="minimal-sub-row" key={dept.departmentId}>
                      <span className={`sub-rank-badge rank-${dept.rank}`}>{dept.rank}</span>
                      <strong className="sub-row-name">{dept.departmentName}</strong>
                      <b className="sub-row-score">{dept.totalScore.toLocaleString("ko-KR")}점</b>
                    </div>
                  ))
                ) : (
                  <p className="sub-empty">등록된 기록이 없습니다.</p>
                )}
              </div>
            </div>

            <div className="minimal-sub-column">
              <div className="sub-column-header">
                <h3>{selectedGame.rankingMode === "team" ? "팀" : "개인"} 상위 5위</h3>
                <span className="sub-column-badge">최고 점수</span>
              </div>
              <div className="minimal-sub-rows">
                {gamePlayerStandings.length > 0 ? (
                  gamePlayerStandings.map((player) => (
                    <div className="minimal-sub-row" key={player.id}>
                      <span className={`sub-rank-badge rank-${player.rank}`}>{player.rank}</span>
                      <div className="sub-player-wrap">
                        <strong className="sub-row-name">{player.nickname}</strong>
                        <small className="sub-row-dept">{player.departmentName}</small>
                      </div>
                      <b className="sub-row-score">{player.score.toLocaleString("ko-KR")}점</b>
                    </div>
                  ))
                ) : (
                  <p className="sub-empty">등록된 기록이 없습니다.</p>
                )}
              </div>
            </div>
          </div>
      </section>
    </div>
  );
}
