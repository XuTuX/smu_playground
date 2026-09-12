"use client";

import React, { useEffect } from "react";
import type { TeamStanding } from "@/lib/types";

type TeamRankingDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  standings: TeamStanding[];
};

export function TeamRankingDetailModal({
  isOpen,
  onClose,
  standings,
}: TeamRankingDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-modal-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#FFFDF7] border-2 border-stone-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              👥
            </div>
            <div>
              <h2 id="team-modal-title" className="text-xl sm:text-2xl font-black text-stone-900">
                팀게임 순위
              </h2>
              <p className="text-sm font-semibold text-stone-500">
                협동 팀전 미니게임 팀별 랭킹
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 flex items-center justify-center font-bold text-lg transition-colors"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* List of Teams */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {standings.length === 0 ? (
            <div className="py-12 text-center text-stone-500 font-semibold text-base">
              등록된 팀 기록이 없습니다.
            </div>
          ) : (
            standings.map((team) => {
              const rankColor =
                team.rank === 1
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : team.rank === 2
                    ? "bg-slate-100 text-slate-800 border-slate-300"
                    : team.rank === 3
                      ? "bg-orange-100 text-orange-800 border-orange-300"
                      : "bg-stone-100 text-stone-600 border-stone-200";

              return (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-200/80 shadow-sm"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-sm shrink-0 ${rankColor}`}
                    >
                      {team.rank}위
                    </span>
                    <div className="min-w-0">
                      <strong className="block text-base sm:text-lg font-black text-stone-900 truncate">
                        {team.teamName}
                      </strong>
                      <div className="flex items-center gap-2 text-sm font-semibold text-stone-500 truncate">
                        <span>{team.departmentName}</span>
                        <span>·</span>
                        <span className="text-emerald-700 font-bold">{team.gameCount}/3개 게임</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {team.gameScores.map((game) => (
                          <span
                            key={game.gameId}
                            className="px-2 py-1 rounded-lg bg-stone-100 text-sm font-bold text-stone-600"
                          >
                            {game.emoji} {game.score.toLocaleString("ko-KR")}점
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <b className="text-base sm:text-lg font-black text-stone-900 shrink-0 ml-3">
                    {team.score.toLocaleString("ko-KR")}
                    <span className="text-sm font-bold ml-0.5">점</span>
                  </b>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
