import React from "react";

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* Wave Transition Top */}
      <div className="w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-12 sm:h-16 text-[#FDEEA7]"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,40 L1200,120 L0,120 Z" />
        </svg>
      </div>

      {/* Footer Content */}
      <div className="bg-[#FDEEA7] pb-10 pt-2 px-6 sm:px-10">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <strong className="text-lg sm:text-xl font-black text-stone-900 block">
              SMU 놀이터
            </strong>
            <span className="text-xs sm:text-sm font-bold text-stone-600 tracking-wider">
              PLAY TOGETHER, SHINE HIGHER
            </span>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-xs sm:text-sm font-bold text-stone-600 tracking-widest block uppercase">
              GOOD PLAY
            </span>
            <span className="text-xs sm:text-sm font-black text-stone-800 tracking-widest block uppercase">
              BETTER TOMORROW
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
