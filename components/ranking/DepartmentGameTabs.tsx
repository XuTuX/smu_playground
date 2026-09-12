"use client";

import React, { useState } from "react";
import type { DepartmentGameBreakdownItem } from "@/lib/ranking";

interface DepartmentGameTabsProps {
  breakdown: DepartmentGameBreakdownItem[];
}

export function DepartmentGameTabs({ breakdown }: DepartmentGameTabsProps) {
  const [selectedGameId, setSelectedGameId] = useState<string>(
    breakdown[0]?.game.id ?? "",
  );

  const activeItem = breakdown.find((item) => item.game.id === selectedGameId) ?? breakdown[0];

  return (
    <div>
      {/* 가로 게임 탭 / 버튼 목록 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 mb-6">
        {breakdown.map(({ game, bestScore }) => {
          const isSelected = game.id === selectedGameId;

          return (
            <button
              key={game.id}
              type="button"
              onClick={() => setSelectedGameId(game.id)}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "bg-stone-100/90 border-stone-800 ring-1 ring-stone-800 shadow-sm"
                  : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl shrink-0">{game.emoji}</span>
                <span className="font-bold text-sm sm:text-base text-stone-900 truncate">
                  {game.name}
                </span>
              </div>

              <div>
                <div className="font-black text-base sm:text-lg text-stone-900">
                  {bestScore ? `${bestScore.score.toLocaleString("ko-KR")}점` : "-"}
                </div>
                <div className="text-sm font-semibold text-stone-500 truncate mt-0.5">
                  {bestScore ? bestScore.nickname : "기록 없음"}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 선택된 게임의 세로 랭킹 목록 */}
      {activeItem && (
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-2">
            <div className="flex items-center gap-2 font-black text-base sm:text-lg text-stone-900">
              <span>{activeItem.game.emoji}</span>
              <span>{activeItem.game.name} 랭킹</span>
            </div>
            <span className="text-sm font-semibold text-stone-500">
              총 {activeItem.allScores.length}명 참여
            </span>
          </div>

          {activeItem.allScores.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {activeItem.allScores.map((score) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between py-3 text-sm sm:text-base"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-6 text-center font-bold text-stone-400">
                      {score.rank}
                    </span>
                    <span className="font-bold text-stone-900 truncate">
                      {score.nickname}
                    </span>
                  </div>
                  <span className="font-extrabold text-stone-900 shrink-0 ml-4">
                    {score.score.toLocaleString("ko-KR")}점
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm font-semibold text-stone-400">
              등록된 참가자 기록이 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
