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
      border: "border-amber-200/60",
      shadow: "shadow-[0_8px_30px_rgba(245,180,0,0.08)]",
      badgeBg: "bg-amber-100",
      accentText: "text-amber-700",
    },
    sky: {
      cardBg: "bg-[#EEF6FF]",
      border: "border-sky-200/70",
      shadow: "shadow-[0_8px_30px_rgba(56,150,240,0.08)]",
      badgeBg: "bg-sky-100",
      accentText: "text-sky-700",
    },
    mint: {
      cardBg: "bg-[#EAF8F1]",
      border: "border-emerald-200/70",
      shadow: "shadow-[0_8px_30px_rgba(40,180,120,0.08)]",
      badgeBg: "bg-emerald-100",
      accentText: "text-emerald-700",
    },
  }[theme];

  const content = (
    <div
      className={`relative flex flex-col justify-between h-full p-4 sm:p-7 rounded-[28px] border ${themeStyles.border} ${themeStyles.cardBg} ${themeStyles.shadow} transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer select-none`}
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
          className="w-10 h-10 rounded-full bg-white border border-stone-200/80 flex items-center justify-center text-stone-700 shadow-sm shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      {/* Podium Stage */}
      <div className="relative pb-2">
        {/* 3 Podiums Row: 2nd (left), 1st (center), 3rd (right) */}
        <div className="grid grid-cols-3 items-end gap-1.5 sm:gap-3 pt-2 sm:pt-6">
          {/* 2nd Place (Left) */}
          <div className="flex flex-col items-center">
            <div className="mb-1 sm:mb-2 shrink-0">
              <TrophyIcon rank={2} size={48} />
            </div>
            {/* Pedestal Stand */}
            <div className="w-full bg-white/95 backdrop-blur-sm border border-stone-200/70 rounded-t-2xl rounded-b-xl shadow-sm pt-3 pb-2 sm:pt-4 sm:pb-3 px-1 flex flex-col items-center justify-center min-h-[80px] sm:min-h-[96px] text-center">
              <span className="text-sm sm:text-base font-black text-stone-900 leading-tight line-clamp-1">
                {second?.primaryText || "-"}
              </span>
              {second?.subText && (
                <span className="text-sm font-semibold text-stone-500 mt-0.5 line-clamp-1">
                  {second.subText}
                </span>
              )}
              <b className="text-sm sm:text-base font-extrabold text-stone-700 mt-1.5">
                {second ? `${second.score.toLocaleString("ko-KR")}점` : "기록 대기"}
              </b>
            </div>
          </div>

          {/* 1st Place (Center - Tallest) */}
          <div className="flex flex-col items-center -mt-2 sm:-mt-4 z-10">
            <div className="mb-1 sm:mb-2 shrink-0">
              <TrophyIcon rank={1} size={58} />
            </div>
            {/* Pedestal Stand (Tallest) */}
            <div className="w-full bg-white border border-amber-200/80 rounded-t-2xl rounded-b-xl shadow-md pt-3 pb-2 sm:pt-5 sm:pb-4 px-1 flex flex-col items-center justify-center min-h-[90px] sm:min-h-[116px] text-center ring-2 ring-amber-400/20">
              <span className="text-base sm:text-lg font-black text-stone-950 leading-tight line-clamp-1">
                {first?.primaryText || "-"}
              </span>
              {first?.subText && (
                <span className="text-sm font-bold text-stone-600 mt-0.5 line-clamp-1">
                  {first.subText}
                </span>
              )}
              <b className="text-base sm:text-lg font-black text-amber-700 mt-1.5">
                {first ? `${first.score.toLocaleString("ko-KR")}점` : "기록 대기"}
              </b>
            </div>
          </div>

          {/* 3rd Place (Right - Lowest) */}
          <div className="flex flex-col items-center">
            <div className="mb-1 sm:mb-2 shrink-0">
              <TrophyIcon rank={3} size={42} />
            </div>
            {/* Pedestal Stand */}
            <div className="w-full bg-white/95 backdrop-blur-sm border border-stone-200/70 rounded-t-2xl rounded-b-xl shadow-sm pt-2 pb-2 sm:pt-3 sm:pb-3 px-1 flex flex-col items-center justify-center min-h-[72px] sm:min-h-[82px] text-center">
              <span className="text-sm sm:text-base font-black text-stone-900 leading-tight line-clamp-1">
                {third?.primaryText || "-"}
              </span>
              {third?.subText && (
                <span className="text-sm font-semibold text-stone-500 mt-0.5 line-clamp-1">
                  {third.subText}
                </span>
              )}
              <b className="text-sm sm:text-base font-extrabold text-stone-700 mt-1.5">
                {third ? `${third.score.toLocaleString("ko-KR")}점` : "기록 대기"}
              </b>
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
