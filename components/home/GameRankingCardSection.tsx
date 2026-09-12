import React from "react";
import Link from "next/link";
import { games } from "@/data/games";

export function GameRankingCardSection() {
  // Pastel styles corresponding to the mockup
  const gameCardThemes: Record<
    string,
    { bg: string; border: string; icon: string; shortName: string }
  > = {
    reaction: {
      bg: "bg-[#FFF7E8] hover:bg-[#FFEFD2]",
      border: "border-amber-200/70",
      icon: "⭐",
      shortName: "Counting Star",
    },
    flappy: {
      bg: "bg-[#FDECEF] hover:bg-[#FCDAE0]",
      border: "border-rose-200/70",
      icon: "📦",
      shortName: "기사님 주차왕",
    },
    "dino-run": {
      bg: "bg-[#EBF5FE] hover:bg-[#DCEDFD]",
      border: "border-sky-200/70",
      icon: "🚩",
      shortName: "줄넘기 챌린지",
    },
    rhythm: {
      bg: "bg-[#E5F7FE] hover:bg-[#D5F1FD]",
      border: "border-cyan-200/70",
      icon: "🐦",
      shortName: "Flappy 세명",
    },
    timing: {
      bg: "bg-[#F4ECFE] hover:bg-[#EBDEFD]",
      border: "border-purple-200/70",
      icon: "🧠",
      shortName: "내 뇌 살아있다",
    },
  };

  return (
    <section
      id="game-rankings"
      className="mt-8 pt-4 pb-12"
      aria-label="게임별 순위보기"
    >
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 sm:gap-4 items-stretch">
        {/* Left Indicator Card */}
        <div className="md:col-span-2 bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
            🎮
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug">
              게임별 순위보기
            </h2>
            <p className="text-sm font-semibold text-stone-500 mt-0.5">
              각 게임별 랭킹을 확인해보세요!
            </p>
          </div>
        </div>

        {/* 5 Horizontal Game Cards */}
        <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {games.map((game) => {
            const theme = gameCardThemes[game.id] ?? {
              bg: "bg-stone-50 hover:bg-stone-100",
              border: "border-stone-200",
              icon: game.emoji,
              shortName: game.name,
            };

            return (
              <Link
                key={game.id}
                href={`/games/${game.slug}`}
                className={`flex flex-col items-center justify-between p-4 rounded-2xl border ${theme.border} ${theme.bg} transition-all duration-150 hover:-translate-y-1 hover:shadow-md text-center group`}
                title={`${game.name} 순위 보기`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl mb-2 transition-transform group-hover:scale-110">
                  {theme.icon}
                </div>
                <strong className="text-sm sm:text-base font-black text-stone-900 line-clamp-1 leading-tight mb-1">
                  {theme.shortName}
                </strong>
                <span className="text-sm font-bold text-stone-600 flex items-center gap-0.5 group-hover:text-stone-950 mt-auto pt-1">
                  순위 보기 <span aria-hidden="true">›</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
