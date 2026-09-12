import React from "react";
import Link from "next/link";
import { TrophyIcon } from "./TrophyIcon";

export type TopThreePodiumItem = {
  rank: 1 | 2 | 3;
  primaryText: string;
  subText?: string;
  score: number;
  href?: string;
  badge?: string;
  gameScores?: {
    gameId: string;
    gameName: string;
    emoji: string;
    score: number;
  }[];
};

type TopThreePodiumProps = {
  items: TopThreePodiumItem[];
  theme?: "yellow" | "sky" | "mint" | "pink" | "orange";
};

export function TopThreePodium({ items, theme = "yellow" }: TopThreePodiumProps) {
  const first = items.find((i) => i.rank === 1);
  const second = items.find((i) => i.rank === 2);
  const third = items.find((i) => i.rank === 3);

  const renderStand = (
    rank: 1 | 2 | 3,
    item: TopThreePodiumItem | undefined,
  ) => {
    const isFirst = rank === 1;
    const isSecond = rank === 2;

    const minHeightClass = isFirst
      ? "min-h-[114px] sm:min-h-[136px]"
      : isSecond
        ? "min-h-[98px] sm:min-h-[118px]"
        : "min-h-[88px] sm:min-h-[104px]";

    const shadowClass = isFirst ? "shadow-md" : "shadow-sm";
    const trophySize = isFirst ? 58 : isSecond ? 48 : 42;
    const medalEmoji = isFirst ? "🥇" : isSecond ? "🥈" : "🥉";
    const rankLabelColor = isFirst
      ? "text-amber-600 bg-amber-50"
      : isSecond
        ? "text-slate-600 bg-slate-100"
        : "text-orange-700 bg-orange-50";

    const content = (
      <div
        className={`w-full bg-white rounded-t-2xl rounded-b-xl ${shadowClass} py-4 sm:py-6 px-2 sm:px-4 flex flex-col items-center justify-center ${minHeightClass} text-center transition-transform duration-150`}
      >
        {item ? (
          <>
            {/* Rank badge + Department next to it */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap mb-2 sm:mb-2.5">
              <span
                className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-sm font-black ${rankLabelColor}`}
              >
                <span>{medalEmoji}</span>
                <span>{rank}위</span>
              </span>
              {item.subText && (
                <span className="text-sm font-bold text-stone-500 truncate max-w-[140px] sm:max-w-[180px]">
                  {item.subText}
                </span>
              )}
            </div>

            {/* Team name or Nickname only */}
            <strong
              className={`${
                isFirst ? "text-base sm:text-xl font-black text-stone-950" : "text-sm sm:text-lg font-black text-stone-900"
              } leading-tight line-clamp-1 break-keep-all tracking-tight my-0.5 sm:my-1`}
            >
              {item.primaryText}
            </strong>
            <b
              className={`${
                isFirst ? "text-base sm:text-xl font-black text-amber-700" : "text-sm sm:text-base font-extrabold text-stone-800"
              } mt-1 sm:mt-2 mb-1 sm:mb-1.5`}
            >
              {item.score.toLocaleString("ko-KR")}점
            </b>

            {/* Individual Game Scores in Podium (Icon + Score) */}
            {item.gameScores && item.gameScores.length > 0 && (
              <div className="w-full mt-2.5 sm:mt-3.5 pt-2.5 sm:pt-3 border-t border-stone-100 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap px-1">
                {item.gameScores.map((game) => (
                  <span
                    key={game.gameId}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-50 border border-stone-200/70 text-sm font-bold text-stone-700 shadow-2xs"
                    title={`${game.gameName}: ${game.score.toLocaleString("ko-KR")}점`}
                  >
                    <span className="text-base" aria-hidden="true">{game.emoji}</span>
                    <b className="font-black text-stone-900">
                      {game.score.toLocaleString("ko-KR")}점
                    </b>
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-1">
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-sm font-bold mb-1 ${
                isFirst ? "text-amber-600/70 bg-amber-50" : "text-stone-400 bg-stone-100"
              }`}
            >
              <span>{medalEmoji}</span>
              <span>{rank}위</span>
            </span>
            <span className="text-sm sm:text-base font-bold text-stone-400 mt-0.5">
              기록 대기
            </span>
          </div>
        )}
      </div>
    );

    const columnClass = isFirst
      ? "flex flex-col items-center -mt-2 sm:-mt-4 z-10 w-full"
      : "flex flex-col items-center w-full";

    return (
      <div className={columnClass}>
        <div className="mb-1 sm:mb-2 shrink-0">
          <TrophyIcon rank={rank} size={trophySize} />
        </div>
        {item?.href ? (
          <Link
            href={item.href}
            className="w-full block hover:-translate-y-1 transition-transform"
            title={`${item.primaryText} 상세 보기`}
          >
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl sm:max-w-4xl mx-auto py-3 sm:py-6">
      <div className="grid grid-cols-[1fr_1.35fr_1fr] items-end gap-2 sm:gap-4">
        {/* 2nd Place (Left) */}
        {renderStand(2, second)}

        {/* 1st Place (Center - Tallest & Wider) */}
        {renderStand(1, first)}

        {/* 3rd Place (Right - Lowest) */}
        {renderStand(3, third)}
      </div>
    </div>
  );
}
