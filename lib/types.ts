export type College = {
  id: string;
  name: string;
  sortOrder: number;
};

export type Department = {
  id: string;
  collegeId: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

export type Game = {
  id: string;
  slug: string;
  code: string;
  name: string;
  description: string;
  deviceId: string;
  accent: "yellow" | "pink" | "sky" | "mint" | "orange";
  maxScore: number;
  isActive: boolean;
};

export type ScoreRecord = {
  id: string;
  sessionId: string;
  gameId: string;
  departmentId: string;
  nickname: string;
  score: number;
  createdAt: string;
};

export type GameSession = {
  id: string;
  eventId: string | null;
  deviceId: string;
  gameId: string;
  score: number;
  status: "pending" | "registered" | "expired";
  createdAt: string;
  claimedAt: string | null;
};

export type DepartmentStanding = {
  rank: number;
  departmentId: string;
  departmentName: string;
  totalScore: number;
  playerCount: number;
};

export type PlayerStanding = ScoreRecord & {
  rank: number;
  departmentName: string;
  gameName: string;
  gameCode: string;
};

export type ActivityItem = {
  id: string;
  gameCode: string;
  gameName: string;
  departmentName: string;
  nickname: string;
  score: number;
  createdAt: string;
};

export type DashboardData = {
  champion: DepartmentStanding;
  departmentStandings: DepartmentStanding[];
  playerCount: number;
  playCount: number;
  hotGame: Game;
  activities: ActivityItem[];
  heatmap: Array<{
    departmentId: string;
    departmentName: string;
    cells: Array<"recent" | "record" | "empty">;
  }>;
  updatedAt: string;
};

export type RegistrationResult = {
  scoreId: string;
  nickname: string;
  departmentName: string;
  gameCode: string;
  score: number;
  playerRank: number;
  departmentRank: number;
};
