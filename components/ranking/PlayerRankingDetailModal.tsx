"use client";

import React, { useState, useEffect } from "react";
import type { DetailedPlayerStanding } from "@/lib/types";

type PlayerRankingDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  standings: DetailedPlayerStanding[];
};

export function PlayerRankingDetailModal({
  isOpen,
  onClose,
  standings,
}: PlayerRankingDetailModalProps) {
  const [expandedPlayerIds, setExpandedPlayerIds] = useState<Set<string>>(
    new Set(standings.slice(0, 3).map((s) => s.id)),
  );

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

  const toggleExpand = (id: string) => {
    setExpandedPlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-modal-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#FFFDF7] border-2 border-stone-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🏆
            </div>
            <div>
              <h2 id="player-modal-title" className="text-xl sm:text-2xl font-black text-stone-900">
                개인 순위 및 게임별 점수
              </h2>
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

        {/* List of Players with Expandable Game Breakdowns */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-3 divide-y divide-stone-100">
          {standings.length === 0 ? (
            <div className="py-12 text-center text-stone-500 font-semibold text-base">
              등록된 참가자 기록이 없습니다.
            </div>
          ) : (
            standings.map((player) => {
              const isExpanded = expandedPlayerIds.has(player.id);
              const rankColor =
                player.rank === 1
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : player.rank === 2
                    ? "bg-slate-100 text-slate-800 border-slate-300"
                    : player.rank === 3
                      ? "bg-orange-100 text-orange-800 border-orange-300"
                      : "bg-stone-100 text-stone-600 border-stone-200";

              return (
                <div
                  key={player.id}
                  className="pt-3 first:pt-0 bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm transition-all"
                >
                  <div
                    className="flex items-center justify-between gap-3 cursor-pointer"
                    onClick={() => toggleExpand(player.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-sm shrink-0 ${rankColor}`}
                      >
                        {player.rank}위
                      </span>
                      <div className="min-w-0">
                        <strong className="block text-base sm:text-lg font-black text-stone-900 truncate">
                          {player.nickname}
                        </strong>
                        <span className="text-sm font-semibold text-stone-500 truncate block">
                          {player.departmentName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-bold text-stone-500 block">총점</span>
                        <b className="text-base sm:text-lg font-black text-stone-900">
                          {player.totalScore.toLocaleString("ko-KR")}
                          <span className="text-sm font-bold ml-0.5">점</span>
                        </b>
                      </div>
                      <span
                        className={`text-stone-400 font-bold transition-transform duration-150 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      >
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-stone-100 animate-fade-in">
                      <div className="text-sm font-bold text-stone-600 mb-2">
                        참여 게임별 획득 점수
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {player.gameScores.map((game) => (
                          <div
                            key={game.gameId}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100"
                          >
                            <span className="text-sm font-bold text-stone-700 truncate mr-2">
                              {game.emoji} {game.gameName}
                            </span>
                            <b className="text-sm font-black text-sky-700 shrink-0">
                              {game.score.toLocaleString("ko-KR")}점
                            </b>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
