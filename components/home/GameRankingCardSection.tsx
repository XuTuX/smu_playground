import React from "react";
import Link from "next/link";
import { games } from "@/data/games";

export function GameRankingCardSection() {
  // Pastel styles corresponding to the mockup
  const gameCardThemes: Record<
    string,
    { bg: string; border: string; icon: string; shortName: string }
  > = {
    parking: {
      bg: "bg-[#FDECEF] hover:bg-[#FCDAE0]",
      border: "",
      icon: "🚗",
      shortName: "주차왕 대작전",
    },
    star: {
      bg: "bg-[#FFF7E8] hover:bg-[#FFEFD2]",
      border: "",
      icon: "⭐",
      shortName: "별별 협동작전",
    },
    rope: {
      bg: "bg-[#EBF5FE] hover:bg-[#DCEDFD]",
      border: "",
      icon: "🏃",
      shortName: "줄넘기 챌린지",
    },
    memory: {
      bg: "bg-[#F4ECFE] hover:bg-[#EBDEFD]",
      border: "",
      icon: "🚦",
      shortName: "신호등 암기",
    },
    jump: {
      bg: "bg-[#E5F7FE] hover:bg-[#D5F1FD]",
      border: "",
      icon: "🕹️",
      shortName: "직선점프",
    },
    // Fallbacks for legacy IDs
    flappy: {
      bg: "bg-[#FDECEF] hover:bg-[#FCDAE0]",
      border: "",
      icon: "🚗",
      shortName: "주차왕 대작전",
    },
    reaction: {
      bg: "bg-[#FFF7E8] hover:bg-[#FFEFD2]",
      border: "",
      icon: "⭐",
      shortName: "별별 협동작전",
    },
    "dino-run": {
      bg: "bg-[#EBF5FE] hover:bg-[#DCEDFD]",
      border: "",
      icon: "🏃",
      shortName: "줄넘기 챌린지",
    },
    timing: {
      bg: "bg-[#F4ECFE] hover:bg-[#EBDEFD]",
      border: "",
      icon: "🚦",
      shortName: "신호등 암기",
    },
    rhythm: {
      bg: "bg-[#E5F7FE] hover:bg-[#D5F1FD]",
      border: "",
      icon: "🕹️",
      shortName: "직선점프",
    },
  };

  return (
    <section
      id="game-rankings"
      className="mt-6 sm:mt-8 pt-2 sm:pt-4 pb-8 sm:pb-12"
      aria-label="게임별 순위보기"
    >
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2.5 sm:gap-4 items-stretch">
        {/* Left Indicator Card */}
        <div className="md:col-span-2 bg-white rounded-3xl p-4 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-sm shrink-0">
            🎮
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-stone-900 leading-snug">
              게임별 순위보기
            </h2>
          </div>
        </div>

        {/* 5 Horizontal Game Cards */}
        <div className="md:col-span-4 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {games.map((game) => {
            const theme = gameCardThemes[game.id] ?? {
              bg: "bg-stone-50 hover:bg-stone-100",
              border: "",
              icon: game.emoji,
              shortName: game.name,
            };

            return (
              <Link
                key={game.id}
                href={`/games/${game.slug}`}
                className={`flex flex-col items-center justify-between p-3 sm:p-4 rounded-2xl ${theme.bg} shadow-sm transition-all duration-150 hover:-translate-y-1 hover:shadow-md text-center group`}
                title={`${game.name} 순위 보기`}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-1.5 sm:mb-2 transition-transform group-hover:scale-110">
                  {theme.icon}
                </div>
                <strong className="text-sm font-black text-stone-900 line-clamp-1 leading-tight mb-1">
                  {theme.shortName}
                </strong>
                <span className="text-sm font-bold text-stone-600 items-center gap-0.5 group-hover:text-stone-950 mt-auto pt-1 hidden sm:flex">
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
