import React from "react";
import Link from "next/link";
import { TrophyIcon } from "./TrophyIcon";

export type PodiumItem = {
  rank: 1 | 2 | 3;
  primaryText: string;
  subText?: string;
  score: number;
};

type CardTheme = "yellow" | "sky" | "mint";

type RankingPodiumCardProps = {
  theme: CardTheme;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  items: PodiumItem[]; // items for 1, 2, 3
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

export function RankingPodiumCard({
  theme,
  title,
  subtitle,
  icon,
  items,
  href,
  onClick,
  ariaLabel,
}: RankingPodiumCardProps) {
  const first = items.find((i) => i.rank === 1);
  const second = items.find((i) => i.rank === 2);
  const third = items.find((i) => i.rank === 3);

  const themeStyles = {
    yellow: {
      cardBg: "bg-[#FFF9EC]",
      border: "",
      shadow: "shadow-[0_8px_30px_rgba(245,180,0,0.08)]",
      badgeBg: "bg-amber-100",
      accentText: "text-amber-700",
    },
    sky: {
      cardBg: "bg-[#EEF6FF]",
      border: "",
      shadow: "shadow-[0_8px_30px_rgba(56,150,240,0.08)]",
      badgeBg: "bg-sky-100",
      accentText: "text-sky-700",
    },
    mint: {
      cardBg: "bg-[#EAF8F1]",
      border: "",
      shadow: "shadow-[0_8px_30px_rgba(40,180,120,0.08)]",
      badgeBg: "bg-emerald-100",
      accentText: "text-emerald-700",
    },
  }[theme];

  const content = (
    <div
      className={`relative flex flex-col justify-between h-full p-4 sm:p-7 rounded-[28px] ${themeStyles.cardBg} ${themeStyles.shadow} transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer select-none overflow-hidden`}
      role="region"
      aria-label={ariaLabel || title}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4 mb-2 sm:mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            {icon}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-snug">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm font-semibold text-stone-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Round Arrow Button */}
        <div
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-stone-700 shadow-sm shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      {/* Podium Stage */}
      <div className="relative pb-3 sm:pb-4">
        {/* 3 Podiums Row: 2nd (left), 1st (center), 3rd (right) */}
        {/* 3 Podiums Row: 2nd (left), 1st (center), 3rd (right) */}
        <div className="grid grid-cols-[1fr_1.35fr_1fr] items-end gap-1.5 sm:gap-2.5 pt-2 sm:pt-6">
          {/* 2nd Place (Left) */}
          <div className="flex flex-col items-center">
            <div className="mb-1 sm:mb-2 shrink-0">
              <TrophyIcon rank={2} size={48} />
            </div>
            {/* Pedestal Stand */}
            <div className="w-full bg-white/95 backdrop-blur-sm rounded-t-2xl rounded-b-xl shadow-sm py-3.5 sm:py-5 px-1 sm:px-2 flex flex-col items-center justify-center min-h-[88px] sm:min-h-[104px] text-center">
              {second ? (
                <>
                  <div className="flex items-center justify-center gap-1 flex-wrap mb-1.5 sm:mb-2">
                    <span className="text-sm font-black text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded-md">
                      2위
                    </span>
                    {second.subText && (
                      <span className="text-sm font-bold text-stone-500 truncate max-w-[90px] sm:max-w-[120px]">
                        {second.subText}
                      </span>
                    )}
                  </div>
                  <span className="text-sm sm:text-base font-black text-stone-900 leading-tight line-clamp-1 break-keep-all text-center tracking-tight">
                    {second.primaryText}
                  </span>
                  <b className="text-sm sm:text-base font-extrabold text-stone-700 my-1 sm:my-1.5">
                    {second.score.toLocaleString("ko-KR")}점
                  </b>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-1">
                  <span className="text-sm font-black text-stone-400">
                    2위
                  </span>
                  <span className="text-sm sm:text-base font-bold text-stone-400 mt-0.5">
                    기록 대기
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 1st Place (Center - Tallest & Wider) */}
          <div className="flex flex-col items-center -mt-2 sm:-mt-4 z-10">
            <div className="mb-1 sm:mb-2 shrink-0">
              <TrophyIcon rank={1} size={58} />
            </div>
            {/* Pedestal Stand (Tallest) */}
            <div className="w-full bg-white rounded-t-2xl rounded-b-xl shadow-md py-4 sm:py-6 px-1.5 sm:px-2.5 flex flex-col items-center justify-center min-h-[102px] sm:min-h-[120px] text-center">
              {first ? (
                <>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap mb-1.5 sm:mb-2">
                    <span className="text-sm font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      1위
                    </span>
                    {first.subText && (
                      <span className="text-sm font-bold text-stone-500 truncate max-w-[120px] sm:max-w-[160px]">
                        {first.subText}
                      </span>
                    )}
                  </div>
                  <span className="text-base sm:text-lg font-black text-stone-950 leading-tight line-clamp-1 break-keep-all text-center tracking-tight">
                    {first.primaryText}
                  </span>
                  <b className="text-base sm:text-lg font-black text-amber-700 my-1 sm:my-1.5">
                    {first.score.toLocaleString("ko-KR")}점
                  </b>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-1">
                  <span className="text-sm font-black text-amber-600/70">
                    1위
                  </span>
                  <span className="text-base sm:text-lg font-bold text-stone-400 mt-0.5">
                    기록 대기
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3rd Place (Right - Lowest) */}
          <div className="flex flex-col items-center">
            <div className="mb-1 sm:mb-2 shrink-0">
              <TrophyIcon rank={3} size={42} />
            </div>
            {/* Pedestal Stand */}
            <div className="w-full bg-white/95 backdrop-blur-sm rounded-t-2xl rounded-b-xl shadow-sm py-3 sm:py-4.5 px-1 sm:px-2 flex flex-col items-center justify-center min-h-[78px] sm:min-h-[90px] text-center">
              {third ? (
                <>
                  <div className="flex items-center justify-center gap-1 flex-wrap mb-1.5 sm:mb-2">
                    <span className="text-sm font-black text-orange-800 bg-orange-100 px-1.5 py-0.2 rounded-md">
                      3위
                    </span>
                    {third.subText && (
                      <span className="text-sm font-bold text-stone-500 truncate max-w-[90px] sm:max-w-[120px]">
                        {third.subText}
                      </span>
                    )}
                  </div>
                  <span className="text-sm sm:text-base font-black text-stone-900 leading-tight line-clamp-1 break-keep-all text-center tracking-tight">
                    {third.primaryText}
                  </span>
                  <b className="text-sm sm:text-base font-extrabold text-stone-700 my-1 sm:my-1.5">
                    {third.score.toLocaleString("ko-KR")}점
                  </b>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-1">
                  <span className="text-sm font-black text-stone-400">
                    3위
                  </span>
                  <span className="text-sm sm:text-base font-bold text-stone-400 mt-0.5">
                    기록 대기
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full group outline-none focus-visible:ring-4 focus-visible:ring-amber-400 rounded-[28px]">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full h-full text-left group outline-none focus-visible:ring-4 focus-visible:ring-sky-400 rounded-[28px]"
    >
      {content}
    </button>
  );
}
