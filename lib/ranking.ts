import { departments, getDepartment } from "@/data/departments";
import { games, getGame } from "@/data/games";
import type {
  ActivityItem,
  DashboardData,
  DepartmentStanding,
  DetailedPlayerStanding,
  PlayerGameScoreBreakdown,
  PlayerStanding,
  ScoreRecord,
  TeamStanding,
} from "@/lib/types";

export function getDepartmentStandings(
  scores: ScoreRecord[],
): DepartmentStanding[] {
  const totals = new Map<string, { totalScore: number; players: Set<string> }>();
  const scoresByDepartmentAndGame = new Map<string, ScoreRecord[]>();

  for (const department of departments) {
    totals.set(department.id, { totalScore: 0, players: new Set() });
  }

  for (const score of scores) {
    const entry = totals.get(score.departmentId);
    if (!entry || !getGame(score.gameId)?.isActive) continue;

    entry.players.add(score.playerId ?? `${score.departmentId}:${score.nickname}`);
    const key = `${score.departmentId}:${score.gameId}`;
    const bucket = scoresByDepartmentAndGame.get(key) ?? [];
    bucket.push(score);
    scoresByDepartmentAndGame.set(key, bucket);
  }

  for (const [key, bucket] of scoresByDepartmentAndGame) {
    const departmentId = key.slice(0, key.lastIndexOf(":"));
    const entry = totals.get(departmentId);
    if (!entry) continue;
    entry.totalScore += bucket
      .sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt))
      .slice(0, 1)
      .reduce((sum, score) => sum + score.score, 0);
  }

  return departments
    .map((department) => {
      const total = totals.get(department.id);
      return {
        rank: 0,
        departmentId: department.id,
        departmentName: department.name,
        totalScore: total?.totalScore ?? 0,
        playerCount: total?.players.size ?? 0,
      };
    })
    .filter((standing) => standing.totalScore > 0)
    .sort(
      (a, b) =>
        b.totalScore - a.totalScore ||
        a.departmentName.localeCompare(b.departmentName, "ko"),
    )
    .map((standing, index) => ({ ...standing, rank: index + 1 }));
}

export function getPlayerStandings(
  scores: ScoreRecord[],
  options: { gameId?: string; departmentId?: string; limit?: number } = {},
): PlayerStanding[] {
  const filtered = scores
    .filter(
      (score) =>
        (!options.gameId || score.gameId === options.gameId) &&
        (!options.departmentId || score.departmentId === options.departmentId),
    )
    .sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt));

  const limited = options.limit ? filtered.slice(0, options.limit) : filtered;
  return limited.map((score, index) => ({
    ...score,
    rank: index + 1,
    departmentName: getDepartment(score.departmentId)?.name ?? "알 수 없는 학과",
    gameName: getGame(score.gameId)?.name ?? "UNKNOWN",
    gameCode: getGame(score.gameId)?.code ?? "GAME",
  }));
}

export function getOverallPlayerStandings(
  scores: ScoreRecord[],
  options: { departmentId?: string; limit?: number } = {},
): PlayerStanding[] {
  const players = new Map<
    string,
    {
      departmentId: string;
      nickname: string;
      bestByGame: Map<string, ScoreRecord>;
      latestScore: ScoreRecord;
    }
  >();

  for (const score of scores) {
    if (getGame(score.gameId)?.rankingMode === "team") continue;

    if (options.departmentId && score.departmentId !== options.departmentId) {
      continue;
    }

    const key = score.playerId ?? `${score.departmentId}:${score.nickname}`;
    const player = players.get(key) ?? {
      departmentId: score.departmentId,
      nickname: score.nickname,
      bestByGame: new Map<string, ScoreRecord>(),
      latestScore: score,
    };
    const gameBest = player.bestByGame.get(score.gameId);

    if (
      !gameBest ||
      score.score > gameBest.score ||
      (score.score === gameBest.score && score.createdAt < gameBest.createdAt)
    ) {
      player.bestByGame.set(score.gameId, score);
    }
    if (score.createdAt > player.latestScore.createdAt) {
      player.latestScore = score;
    }
    players.set(key, player);
  }

  const standings = [...players.values()]
    .map((player) => ({
      player,
      totalScore: [...player.bestByGame.values()].reduce(
        (total, score) => total + score.score,
        0,
      ),
      gameCount: player.bestByGame.size,
    }))
    .sort(
      (a, b) =>
        b.totalScore - a.totalScore ||
        b.gameCount - a.gameCount ||
        a.player.nickname.localeCompare(b.player.nickname, "ko"),
    );
  const limited = options.limit ? standings.slice(0, options.limit) : standings;

  return limited.map(({ player, totalScore }, index) => ({
    ...player.latestScore,
    id: `overall:${player.latestScore.playerId ?? `${player.departmentId}:${player.nickname}`}`,
    gameId: "overall",
    score: totalScore,
    rank: index + 1,
    departmentName:
      getDepartment(player.departmentId)?.name ?? "알 수 없는 학과",
    gameName: "전체 게임",
    gameCode: "TOTAL",
  }));
}

export function getDetailedPlayerStandings(
  scores: ScoreRecord[],
  options: { departmentId?: string; limit?: number } = {},
): DetailedPlayerStanding[] {
  const players = new Map<
    string,
    {
      departmentId: string;
      nickname: string;
      bestByGame: Map<string, ScoreRecord>;
      latestScore: ScoreRecord;
    }
  >();

  for (const score of scores) {
    if (getGame(score.gameId)?.rankingMode === "team") continue;
    if (options.departmentId && score.departmentId !== options.departmentId) continue;

    const key = score.playerId ?? `${score.departmentId}:${score.nickname}`;
    const player = players.get(key) ?? {
      departmentId: score.departmentId,
      nickname: score.nickname,
      bestByGame: new Map<string, ScoreRecord>(),
      latestScore: score,
    };
    const gameBest = player.bestByGame.get(score.gameId);
    if (
      !gameBest ||
      score.score > gameBest.score ||
      (score.score === gameBest.score && score.createdAt < gameBest.createdAt)
    ) {
      player.bestByGame.set(score.gameId, score);
    }
    if (score.createdAt > player.latestScore.createdAt) {
      player.latestScore = score;
    }
    players.set(key, player);
  }

  const standings: DetailedPlayerStanding[] = [...players.entries()]
    .map(([key, player]) => {
      const gameScores: PlayerGameScoreBreakdown[] = games
        .filter((g) => g.isActive && g.rankingMode !== "team")
        .map((g) => {
          const rec = player.bestByGame.get(g.id);
          return {
            gameId: g.id,
            gameName: g.name,
            emoji: g.emoji,
            score: rec ? rec.score : 0,
          };
        })
        .filter((gs) => gs.score > 0);

      const totalScore = [...player.bestByGame.values()].reduce((sum, s) => sum + s.score, 0);

      return {
        id: `player:${key}`,
        rank: 0,
        nickname: player.nickname,
        departmentId: player.departmentId,
        departmentName: getDepartment(player.departmentId)?.name ?? "알 수 없는 학과",
        totalScore,
        gameCount: player.bestByGame.size,
        gameScores,
      };
    })
    .sort(
      (a, b) =>
        b.totalScore - a.totalScore ||
        b.gameCount - a.gameCount ||
        a.nickname.localeCompare(b.nickname, "ko"),
    )
    .map((standing, index) => ({ ...standing, rank: index + 1 }));

  return options.limit ? standings.slice(0, options.limit) : standings;
}

export function getTeamStandings(
  scores: ScoreRecord[],
  options: { limit?: number } = {},
): TeamStanding[] {
  const teamScores = scores.filter((score) => {
    const game = getGame(score.gameId);
    return game?.isActive && game.rankingMode === "team";
  });

  const teamsMap = new Map<
    string,
    {
      teamName: string;
      departmentId: string;
      bestByGame: Map<string, ScoreRecord>;
      createdAt: string;
    }
  >();

  for (const s of teamScores) {
    const teamName = (s.teamName || s.nickname || "").trim();
    if (!teamName) continue;
    const key = s.playerId ?? teamName.toLocaleLowerCase("ko");
    const existing = teamsMap.get(key) ?? {
      teamName,
      departmentId: s.departmentId,
      bestByGame: new Map<string, ScoreRecord>(),
      createdAt: s.createdAt,
    };
    const gameBest = existing.bestByGame.get(s.gameId);
    if (
      !gameBest ||
      s.score > gameBest.score ||
      (s.score === gameBest.score && s.createdAt < gameBest.createdAt)
    ) {
      existing.bestByGame.set(s.gameId, s);
    }
    if (s.createdAt > existing.createdAt) existing.createdAt = s.createdAt;
    teamsMap.set(key, existing);
  }

  const standings: TeamStanding[] = [...teamsMap.entries()]
    .map(([key, team]) => {
      const gameScores = games
        .filter((game) => game.isActive && game.rankingMode === "team")
        .map((game) => ({
          gameId: game.id,
          gameName: game.name,
          emoji: game.emoji,
          score: team.bestByGame.get(game.id)?.score ?? 0,
        }));
      const totalScore = gameScores.reduce((total, game) => total + game.score, 0);
      return {
        id: `team:${key}`,
        rank: 0,
        teamName: team.teamName,
        departmentId: team.departmentId,
        departmentName: getDepartment(team.departmentId)?.name ?? "알 수 없는 학과",
        gameId: "team-overall",
        gameName: "팀게임 종합",
        emoji: "👥",
        score: totalScore,
        gameCount: gameScores.filter(({ score }) => score > 0).length,
        gameScores,
        createdAt: team.createdAt,
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.gameCount - a.gameCount ||
        a.teamName.localeCompare(b.teamName, "ko"),
    )
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return options.limit ? standings.slice(0, options.limit) : standings;
}

function getActivities(scores: ScoreRecord[]): ActivityItem[] {
  return [...scores]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8)
    .map((score) => ({
      id: score.id,
      gameCode: getGame(score.gameId)?.code ?? "GAME",
      gameName: getGame(score.gameId)?.name ?? "UNKNOWN",
      departmentName: getDepartment(score.departmentId)?.name ?? "알 수 없는 학과",
      nickname: score.nickname,
      score: score.score,
      createdAt: score.createdAt,
    }));
}

export function getDashboardData(scores: ScoreRecord[]): DashboardData {
  const departmentStandings = getDepartmentStandings(scores);
  const gameCounts = games.map((game) => ({
    game,
    count: scores.filter((score) => score.gameId === game.id).length,
  }));
  const hotGame = gameCounts.sort((a, b) => b.count - a.count)[0]?.game ?? games[0];
  const recordIds = new Set(
    games.flatMap((game) => {
      const maximum = Math.max(
        0,
        ...scores.filter((score) => score.gameId === game.id).map((score) => score.score),
      );
      return scores
        .filter((score) => score.gameId === game.id && score.score === maximum)
        .map((score) => score.id);
    }),
  );

  const heatmap = departmentStandings.slice(0, 7).map((standing) => {
    const recent = scores
      .filter((score) => score.departmentId === standing.departmentId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8);
    return {
      departmentId: standing.departmentId,
      departmentName: standing.departmentName,
      cells: Array.from({ length: 8 }, (_, index) => {
        const score = recent[index];
        if (!score) return "empty" as const;
        return recordIds.has(score.id) ? ("record" as const) : ("recent" as const);
      }),
    };
  });

  const uniquePlayers = new Set(
    scores.map(
      (score) => score.playerId ?? `${score.departmentId}:${score.nickname}`,
    ),
  );

  return {
    champion: departmentStandings[0] ?? {
      rank: 1,
      departmentId: "ai-computer",
      departmentName: "AI컴퓨터학부",
      totalScore: 0,
      playerCount: 0,
    },
    departmentStandings,
    playerCount: uniquePlayers.size,
    playCount: scores.length,
    hotGame,
    activities: getActivities(scores),
    heatmap,
    updatedAt: new Date().toISOString(),
  };
}

export type DepartmentGameScoreEntry = {
  id: string;
  rank: number;
  nickname: string;
  score: number;
  isDepartmentFirst: boolean;
  createdAt: string;
};

export type DepartmentGameBreakdownItem = {
  game: (typeof games)[number];
  topScores: ScoreRecord[];
  allScores: DepartmentGameScoreEntry[];
  bestScore: DepartmentGameScoreEntry | null;
  subtotal: number;
  departmentRankInGame: number;
  topPerformer: {
    nickname: string;
    score: number;
  } | null;
};

export function getDepartmentGameBreakdown(
  scores: ScoreRecord[],
  departmentId: string,
): DepartmentGameBreakdownItem[] {
  return games.map((game) => {
    // 1. Calculate all departments' subtotals for this game to determine rank
    const deptTotalsForGame = departments
      .map((dept) => {
        const deptScoresInGame = scores
          .filter((s) => s.departmentId === dept.id && s.gameId === game.id)
          .sort((a, b) => b.score - a.score)
          .slice(0, 1);
        const subtotal = deptScoresInGame.reduce((sum, s) => sum + s.score, 0);
        return { departmentId: dept.id, subtotal };
      })
      .filter((d) => d.subtotal > 0)
      .sort((a, b) => b.subtotal - a.subtotal);

    const rankIndex = deptTotalsForGame.findIndex((d) => d.departmentId === departmentId);
    const departmentRankInGame = rankIndex >= 0 ? rankIndex + 1 : deptTotalsForGame.length + 1;

    // 2. Collect all scores for this department in this game (best score per participant)
    const gameDeptScores = scores.filter(
      (score) => score.departmentId === departmentId && score.gameId === game.id,
    );

    const bestByParticipant = new Map<string, ScoreRecord>();
    for (const score of gameDeptScores) {
      const key = score.playerId ?? score.nickname;
      const prev = bestByParticipant.get(key);
      if (
        !prev ||
        score.score > prev.score ||
        (score.score === prev.score && score.createdAt < prev.createdAt)
      ) {
        bestByParticipant.set(key, score);
      }
    }

    const sortedScores = [...bestByParticipant.values()].sort(
      (a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt),
    );

    const allScores: DepartmentGameScoreEntry[] = sortedScores.map((s, idx) => ({
      id: s.id,
      rank: idx + 1,
      nickname: s.nickname,
      score: s.score,
      isDepartmentFirst: idx === 0,
      createdAt: s.createdAt,
    }));

    const bestScore = allScores[0] ?? null;
    const subtotal = bestScore ? bestScore.score : 0;
    const topPerformer = bestScore
      ? { nickname: bestScore.nickname, score: bestScore.score }
      : null;
    const topScores = sortedScores.slice(0, 1);

    return {
      game,
      topScores,
      allScores,
      bestScore,
      subtotal,
      departmentRankInGame,
      topPerformer,
    };
  });
}
