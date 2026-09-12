"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RankingPodiumCard, type PodiumItem } from "@/components/ranking/RankingPodiumCard";
import { PlayerRankingDetailModal } from "@/components/ranking/PlayerRankingDetailModal";
import { TeamRankingDetailModal } from "@/components/ranking/TeamRankingDetailModal";
import type { DepartmentStanding, DetailedPlayerStanding, TeamStanding } from "@/lib/types";

type HomePodiumSectionProps = {
  departmentStandings: DepartmentStanding[];
  detailedPlayerStandings: DetailedPlayerStanding[];
  teamStandings: TeamStanding[];
};

export function HomePodiumSection({
  departmentStandings,
  detailedPlayerStandings,
  teamStandings,
}: HomePodiumSectionProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const modalParam = searchParams.get("modal");
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const playerModalOpen = isPlayerModalOpen || modalParam === "player";
  const teamModalOpen = isTeamModalOpen || modalParam === "team";

  const handleClosePlayerModal = () => {
    setIsPlayerModalOpen(false);
    if (modalParam === "player") {
      router.replace("/", { scroll: false });
    }
  };

  const handleCloseTeamModal = () => {
    setIsTeamModalOpen(false);
    if (modalParam === "team") {
      router.replace("/", { scroll: false });
    }
  };

  // Convert Department Standings to Podium Items (only actual records)
  const deptItems: PodiumItem[] = departmentStandings
    .filter((d) => d.rank <= 3)
    .map((standing) => ({
      rank: standing.rank as 1 | 2 | 3,
      primaryText: standing.departmentName,
      score: standing.totalScore,
    }));

  // Convert Player Standings to Podium Items (only actual records)
  const playerItems: PodiumItem[] = detailedPlayerStandings
    .filter((p) => p.rank <= 3)
    .map((standing) => ({
      rank: standing.rank as 1 | 2 | 3,
      primaryText: standing.nickname,
      subText: standing.departmentName,
      score: standing.totalScore,
    }));

  // Convert Team Standings to Podium Items (only actual records)
  const teamItems: PodiumItem[] = teamStandings
    .filter((t) => t.rank <= 3)
    .map((standing) => ({
      rank: standing.rank as 1 | 2 | 3,
      primaryText: standing.teamName,
      subText: standing.departmentName,
      score: standing.score,
    }));

  return (
    <section className="mt-4 sm:mt-6" aria-label="청룡체전 핵심 순위">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        {/* 1. 학과 순위 카드 */}
        <RankingPodiumCard
          theme="yellow"
          title="학과 순위"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          }
          items={deptItems}
          href="/departments"
          ariaLabel="학과 순위 상세 보기"
        />

        {/* 2. 개인 순위 카드 */}
        <RankingPodiumCard
          theme="sky"
          title="개인 순위"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
          items={playerItems}
          href="/ranking"
          ariaLabel="개인 순위 및 게임별 점수 구성 보기"
        />

        {/* 3. 팀게임 순위 카드 */}
        <RankingPodiumCard
          theme="mint"
          title="팀게임 순위"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          items={teamItems}
          href="/teams"
          ariaLabel="팀게임 순위 보기"
        />
      </div>

      {/* Personal Ranking Modal with Game Breakdown */}
      <PlayerRankingDetailModal
        isOpen={playerModalOpen}
        onClose={handleClosePlayerModal}
        standings={detailedPlayerStandings}
      />

      {/* Team Ranking Modal */}
      <TeamRankingDetailModal
        isOpen={teamModalOpen}
        onClose={handleCloseTeamModal}
        standings={teamStandings}
      />
    </section>
  );
}
