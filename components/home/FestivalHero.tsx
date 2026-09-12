import React from "react";

export function FestivalHero() {
  return (
    <section className="relative pt-4 pb-4 sm:pt-10 sm:pb-8 text-center overflow-hidden">
      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight text-stone-900 leading-tight flex items-center justify-center flex-wrap gap-x-2.5">
        <span>함께 노는 오늘이,</span>
        <span className="text-amber-500">더 빛나는 우리</span>
      </h1>
    </section>
  );
}
