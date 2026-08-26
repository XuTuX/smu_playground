"use client";

import { useEffect, useState } from "react";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { GameCard } from "@/components/games/GameCard";
import { DepartmentRanking } from "@/components/ranking/DepartmentRanking";
import { PressableLink } from "@/components/ui/PressableLink";
import { RetroCard } from "@/components/ui/RetroCard";
import type { DashboardData, Game } from "@/lib/types";

type GameSummary = { game: Game; highScore: number };

export function HomeDashboard({ initialData, gameSummaries }: { initialData: DashboardData; gameSummaries: GameSummary[] }) {
  const [data, setData] = useState(initialData);
  useEffect(() => {
    const update = async () => { try { const response = await fetch("/api/dashboard", { cache: "no-store" }); if (response.ok) setData((await response.json()) as DashboardData); } catch { /* Initial snapshot remains usable. */ } };
    const timer = window.setInterval(update, 5000); return () => window.clearInterval(timer);
  }, []);

  return <>
    <section className="home-hero site-shell"><RetroCard accent="yellow" className="champion-card"><div className="champion-copy"><p>현재 1위 학과</p><h1>{data.champion.departmentName}</h1><strong>{data.champion.totalScore.toLocaleString("ko-KR")} <small>점</small></strong></div><div className="champion-rank"><b>1위</b></div></RetroCard></section>
    <section className="section-block site-shell department-board-section"><div className="section-heading"><h2>학과별 순위</h2><PressableLink href="/departments" className="pressable-cream">전체 순위 보기</PressableLink></div><RetroCard className="ranking-card department-board-card"><DepartmentRanking standings={data.departmentStandings} limit={8} /></RetroCard></section>
    <section className="section-block site-shell activity-section"><div className="section-heading compact-heading"><h2>최근 게임 기록</h2></div><RetroCard accent="pink" className="feed-card"><ActivityFeed activities={data.activities} /></RetroCard></section>
    <section className="section-block site-shell"><div className="section-heading"><h2>게임 선택</h2><PressableLink href="/games" className="pressable-dark">모든 게임 보기</PressableLink></div><div className="games-grid">{gameSummaries.map((summary) => <GameCard {...summary} key={summary.game.id} />)}</div></section>
  </>;
}
