import { departments, getDepartment } from "@/data/departments";
import { games, getGame } from "@/data/games";
import type {
  ActivityItem,
  DashboardData,
  DepartmentStanding,
  PlayerStanding,
  ScoreRecord,
} from "@/lib/types";

export function getDepartmentStandings(
  scores: ScoreRecord[],
): DepartmentStanding[] {
  const totals = new Map<
    string,
    { totalScore: number; players: Set<string> }
  >();

  for (const department of departments) {
    totals.set(department.id, { totalScore: 0, players: new Set() });
  }

  for (const game of games) {
    for (const department of departments) {
      const departmentGameScores = scores
        .filter(
          (score) =>
            score.gameId === game.id &&
            score.departmentId === department.id,
        )
        .sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt))
        .slice(0, 5);

      const entry = totals.get(department.id);
      if (!entry) continue;
      entry.totalScore += departmentGameScores.reduce(
        (sum, score) => sum + score.score,
        0,
      );
    }
  }

  for (const score of scores) {
    totals.get(score.departmentId)?.players.add(score.nickname);
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
    if (options.departmentId && score.departmentId !== options.departmentId) {
      continue;
    }

    const key = `${score.departmentId}:${score.nickname}`;
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
    id: `overall:${player.departmentId}:${player.nickname}`,
    gameId: "overall",
    score: totalScore,
    rank: index + 1,
    departmentName:
      getDepartment(player.departmentId)?.name ?? "알 수 없는 학과",
    gameName: "전체 게임",
    gameCode: "TOTAL",
  }));
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
    scores.map((score) => `${score.departmentId}:${score.nickname}`),
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

export function getDepartmentGameBreakdown(
  scores: ScoreRecord[],
  departmentId: string,
) {
  return games.map((game) => {
    const topScores = scores
      .filter(
        (score) =>
          score.departmentId === departmentId && score.gameId === game.id,
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    return {
      game,
      topScores,
      subtotal: topScores.reduce((sum, score) => sum + score.score, 0),
    };
  });
}
