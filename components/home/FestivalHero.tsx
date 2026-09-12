import React from "react";

export function FestivalHero() {
  return (
    <section className="relative pt-6 pb-6 sm:pt-10 sm:pb-8 text-center overflow-hidden">
      {/* Playful Hand-drawn Doodle Stickers on desktop edges */}
      <div
        className="hidden lg:flex flex-col items-center absolute left-2 top-8 text-stone-500/80 select-none pointer-events-none transform -rotate-12"
        aria-hidden="true"
      >
        <span className="text-sm tracking-wider font-extrabold uppercase opacity-75">
          PLAY
        </span>
        <span className="text-sm tracking-wider font-extrabold uppercase opacity-75 -mt-1">
          TOGETHER,
        </span>
        <span className="text-sm tracking-wider font-extrabold uppercase opacity-75 -mt-1">
          SHINE HIGHER
        </span>
      </div>

      <div
        className="hidden lg:flex flex-col items-center absolute right-2 top-6 text-stone-500/80 select-none pointer-events-none transform rotate-12"
        aria-hidden="true"
      >
        <span className="text-sm tracking-wider font-extrabold uppercase opacity-75">
          GOOD GAME
        </span>
        <span className="text-sm tracking-wider font-extrabold uppercase opacity-75 -mt-1">
          BETTER US
        </span>
        <div className="w-6 h-6 mt-1 rounded-full border-2 border-stone-500/80 flex items-center justify-center font-bold text-xs opacity-75">
          :)
        </div>
      </div>

      {/* Eyebrow */}
      <div className="inline-block mb-2">
        <span className="text-sm font-black tracking-[0.2em] text-stone-500 uppercase">
          PLAY TOGETHER, SHINE HIGHER
        </span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight text-stone-900 leading-tight flex items-center justify-center flex-wrap gap-x-2.5">
        <span>함께 노는 오늘이,</span>
        <span className="relative inline-block text-amber-500">
          더 빛나는 우리
          {/* Sparkle Sunburst Rays */}
          <svg
            className="absolute -top-3 sm:-top-4 -right-5 sm:-right-7 w-6 h-6 sm:w-8 sm:h-8 text-amber-400 pointer-events-none"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2L13.5 8L19.5 9.5L13.5 11L12 17L10.5 11L4.5 9.5L10.5 8L12 2Z" />
            <path d="M19 16L19.8 19.2L23 20L19.8 20.8L19 24L18.2 20.8L15 20L18.2 19.2L19 16Z" opacity="0.8" />
          </svg>
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mt-3 text-sm sm:text-base md:text-lg font-medium text-stone-600">
        게임으로 하나 되는, 특별한 우리들의 축제
      </p>
    </section>
  );
}
