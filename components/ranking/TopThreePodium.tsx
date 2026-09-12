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
};

export function TopThreePodium({ items }: TopThreePodiumProps) {
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
      ? "text-amber-800 bg-amber-100"
      : isSecond
        ? "text-slate-700 bg-slate-200"
        : "text-orange-800 bg-orange-100";

    const content = (
      <div
        className={`w-full bg-white rounded-t-2xl rounded-b-xl ${shadowClass} py-4 sm:py-6 px-2 sm:px-4 flex flex-col items-center justify-center ${minHeightClass} text-center transition-transform duration-150`}
      >
        {item ? (
          <>
            {/* Rank badge + Department tied into one colored chip */}
            <div className="flex items-center justify-center flex-wrap mb-2 sm:mb-2.5 max-w-full min-w-0">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-black max-w-full ${rankLabelColor}`}
              >
                <span aria-hidden="true">{medalEmoji}</span>
                <span className="shrink-0">{rank}위</span>
                {item.subText && (
                  <span className="font-bold truncate opacity-80 max-w-[110px] sm:max-w-[170px]">
                    {item.subText}
                  </span>
                )}
              </span>
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

    const columnClass =
      "row-start-1 flex flex-col items-center justify-end w-full min-w-0";

    return (
      <div className={columnClass}>
        <div className="mb-1 sm:mb-2 shrink-0">
          <TrophyIcon rank={rank} size={trophySize} />
        </div>
        {item?.href ? (
          <Link
            href={item.href}
            className="w-full min-w-0 block hover:-translate-y-1 transition-transform"
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

  // Game breakdown row rendered separately under the stands so that
  // wrapped chips can never make a lower-ranked stand taller than 1st place.
  const renderChips = (
    rank: 1 | 2 | 3,
    item: TopThreePodiumItem | undefined,
  ) => {
    const games = item?.gameScores ?? [];
    return (
      <div
        key={`chips-${rank}`}
        className={`row-start-2 min-w-0 w-full ${games.length > 0 ? "mt-2 sm:mt-3" : ""}`}
      >
        {games.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 border-t border-stone-100 pt-2 sm:pt-3">
            {games.map((game) => (
              <span
                key={game.gameId}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-stone-200/70 text-sm font-bold text-stone-700 shadow-2xs"
                title={`${game.gameName}: ${game.score.toLocaleString("ko-KR")}점`}
              >
                <span className="text-base" aria-hidden="true">{game.emoji}</span>
                <b className="font-black text-stone-900">
                  {game.score.toLocaleString("ko-KR")}
                </b>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const rankChipClass = {
    1: "text-amber-800 bg-amber-100",
    2: "text-slate-700 bg-slate-200",
    3: "text-orange-800 bg-orange-100",
  } as const;

  const medalByRank = { 1: "🥇", 2: "🥈", 3: "🥉" } as const;

  // Compact stacked row for narrow (mobile) viewports
  const renderMobileRow = (
    rank: 1 | 2 | 3,
    item: TopThreePodiumItem | undefined,
  ) => {
    const isFirst = rank === 1;
    const row = (
      <div
        className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ${
          isFirst ? "ring-2 ring-amber-200" : "ring-1 ring-stone-100"
        }`}
      >
        <span className="shrink-0 text-2xl leading-none" aria-hidden="true">
          {medalByRank[rank]}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-sm font-black ${rankChipClass[rank]}`}
            >
              {rank}위
            </span>
            {item?.subText ? (
              <span className="text-sm font-bold text-stone-500 truncate">
                {item.subText}
              </span>
            ) : null}
          </div>
          {item ? (
            <strong className="block mt-1 text-base font-black text-stone-900 leading-snug line-clamp-1 break-keep-all">
              {item.primaryText}
            </strong>
          ) : (
            <strong className="block mt-1 text-base font-bold text-stone-400">
              기록 대기
            </strong>
          )}
        </div>
        {item ? (
          <b
            className={`shrink-0 text-base font-black ${
              isFirst ? "text-amber-700" : "text-stone-800"
            }`}
          >
            {item.score.toLocaleString("ko-KR")}점
          </b>
        ) : null}
      </div>
    );

    if (item?.href) {
      return (
        <Link
          key={rank}
          href={item.href}
          className="block"
          title={`${item.primaryText} 상세 보기`}
        >
          {row}
        </Link>
      );
    }
    return <div key={rank}>{row}</div>;
  };

  return (
    <div className="w-full max-w-3xl sm:max-w-4xl mx-auto py-3 sm:py-6">
      {/* Mobile: stacked 1 / 2 / 3 rows */}
      <div className="sm:hidden space-y-2.5">
        {renderMobileRow(1, first)}
        {renderMobileRow(2, second)}
        {renderMobileRow(3, third)}
      </div>

      {/* Tablet / Desktop: podium (stands in row 1, game breakdown in row 2) */}
      <div className="hidden sm:grid grid-cols-[1fr_1.35fr_1fr] items-end gap-x-2 sm:gap-x-4">
        {/* 2nd Place (Left) */}
        {renderStand(2, second)}

        {/* 1st Place (Center - Tallest & Wider) */}
        {renderStand(1, first)}

        {/* 3rd Place (Right - Lowest) */}
        {renderStand(3, third)}

        {/* Game score breakdown under each stand */}
        {renderChips(2, second)}
        {renderChips(1, first)}
        {renderChips(3, third)}
      </div>
    </div>
  );
}
