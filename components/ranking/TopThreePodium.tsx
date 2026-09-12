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
        className={`w-full bg-white rounded-t-2xl rounded-b-xl ${shadowClass} pt-3 pb-2.5 sm:pt-4 sm:pb-3 px-1 sm:px-2 flex flex-col items-center justify-center ${minHeightClass} text-center transition-transform duration-150`}
      >
        {item ? (
          <>
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-sm font-black mb-1 ${rankLabelColor}`}
            >
              <span>{medalEmoji}</span>
              <span>{rank}위</span>
            </span>
            <span
              className={`${
                isFirst ? "text-base sm:text-lg font-black text-stone-950" : "text-sm sm:text-base font-black text-stone-900"
              } leading-tight line-clamp-2 break-keep-all tracking-tight`}
            >
              {item.primaryText}
            </span>
            {item.subText && (
              <span className="text-sm font-semibold text-stone-500 mt-0.5 line-clamp-1 w-full px-0.5">
                {item.subText}
              </span>
            )}
            <b
              className={`${
                isFirst ? "text-base sm:text-lg font-black text-amber-700" : "text-sm sm:text-base font-extrabold text-stone-800"
              } mt-1 sm:mt-1.5`}
            >
              {item.score.toLocaleString("ko-KR")}점
            </b>
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
      ? "flex flex-col items-center -mt-2 sm:-mt-4 z-10"
      : "flex flex-col items-center";

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
    <div className="w-full max-w-xl mx-auto pt-2 pb-1">
      <div className="grid grid-cols-3 items-end gap-1.5 sm:gap-3">
        {/* 2nd Place (Left) */}
        {renderStand(2, second)}

        {/* 1st Place (Center - Tallest) */}
        {renderStand(1, first)}

        {/* 3rd Place (Right - Lowest) */}
        {renderStand(3, third)}
      </div>
    </div>
  );
}
