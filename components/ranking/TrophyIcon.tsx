import React from "react";

type TrophyIconProps = {
  rank: 1 | 2 | 3;
  className?: string;
  size?: number;
};

export function TrophyIcon({ rank, className = "", size = 72 }: TrophyIconProps) {
  if (rank === 1) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="gold-cup" x1="20" y1="15" x2="80" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="35%" stopColor="#F5B318" />
            <stop offset="70%" stopColor="#E59800" />
            <stop offset="100%" stopColor="#BF7600" />
          </linearGradient>
          <linearGradient id="gold-highlight" x1="30" y1="20" x2="45" y2="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF9D6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFF9D6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gold-base" x1="35" y1="65" x2="65" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F3B317" />
            <stop offset="50%" stopColor="#D98A00" />
            <stop offset="100%" stopColor="#995800" />
          </linearGradient>
          <filter id="gold-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#995800" floodOpacity="0.25" />
          </filter>
        </defs>

        <g filter="url(#gold-shadow)">
          {/* Left Handle */}
          <path
            d="M26 26 C12 26 10 46 25 52 C27 48 29 45 31 43 C22 39 21 32 28 32 Z"
            fill="#D98A00"
          />
          <path
            d="M27 28 C15 28 13 44 26 50 C25 46 27 43 29 41 C21 37 21 33 28 33 Z"
            fill="#F5B318"
          />

          {/* Right Handle */}
          <path
            d="M74 26 C88 26 90 46 75 52 C73 48 71 45 69 43 C78 39 79 32 72 32 Z"
            fill="#D98A00"
          />
          <path
            d="M73 28 C85 28 87 44 74 50 C75 46 73 43 71 41 C79 37 79 33 72 33 Z"
            fill="#F5B318"
          />

          {/* Cup Body */}
          <path
            d="M25 20 C25 18 75 18 75 20 L72 48 C70 63 58 68 50 68 C42 68 30 63 28 48 Z"
            fill="url(#gold-cup)"
          />

          {/* Rim */}
          <ellipse cx="50" cy="20" rx="25" ry="5.5" fill="#FFE875" />
          <ellipse cx="50" cy="20" rx="22" ry="4" fill="#E69800" />

          {/* Specular Highlight */}
          <path
            d="M32 24 C30 33 32 46 36 53 C34 50 33 40 35 24 Z"
            fill="url(#gold-highlight)"
          />

          {/* Stem */}
          <path d="M46 67 L44 76 L56 76 L54 67 Z" fill="#D98A00" />
          <path d="M47 67 L46 76 L54 76 L53 67 Z" fill="#FFE066" />

          {/* Base Stand */}
          <path d="M38 76 L62 76 L66 84 L34 84 Z" fill="url(#gold-base)" />
          <rect x="32" y="84" width="36" height="6" rx="2" fill="#B36B00" />
          <rect x="33" y="84" width="34" height="2.5" rx="1" fill="#FFE066" />

          {/* Rank Badge Emblem: "1" */}
          <circle cx="50" cy="42" r="12" fill="#FFFFFF" />
          <circle cx="50" cy="42" r="10.5" fill="#FFE46B" />
          <text
            x="50"
            y="48"
            textAnchor="middle"
            fill="#B36200"
            fontSize="16"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
          >
            1
          </text>
        </g>
      </svg>
    );
  }

  if (rank === 2) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="silver-cup" x1="20" y1="15" x2="80" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F1F3F6" />
            <stop offset="35%" stopColor="#D4D9E2" />
            <stop offset="70%" stopColor="#ADB4C2" />
            <stop offset="100%" stopColor="#818898" />
          </linearGradient>
          <linearGradient id="silver-base" x1="35" y1="65" x2="65" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C8CFDB" />
            <stop offset="50%" stopColor="#A2AABC" />
            <stop offset="100%" stopColor="#6C7486" />
          </linearGradient>
          <filter id="silver-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#4B5565" floodOpacity="0.25" />
          </filter>
        </defs>

        <g filter="url(#silver-shadow)">
          {/* Left Handle */}
          <path
            d="M26 26 C12 26 10 46 25 52 C27 48 29 45 31 43 C22 39 21 32 28 32 Z"
            fill="#8B93A4"
          />
          <path
            d="M27 28 C15 28 13 44 26 50 C25 46 27 43 29 41 C21 37 21 33 28 33 Z"
            fill="#DDE2EC"
          />

          {/* Right Handle */}
          <path
            d="M74 26 C88 26 90 46 75 52 C73 48 71 45 69 43 C78 39 79 32 72 32 Z"
            fill="#8B93A4"
          />
          <path
            d="M73 28 C85 28 87 44 74 50 C75 46 73 43 71 41 C79 37 79 33 72 33 Z"
            fill="#DDE2EC"
          />

          {/* Cup Body */}
          <path
            d="M25 20 C25 18 75 18 75 20 L72 48 C70 63 58 68 50 68 C42 68 30 63 28 48 Z"
            fill="url(#silver-cup)"
          />

          {/* Rim */}
          <ellipse cx="50" cy="20" rx="25" ry="5.5" fill="#FFFFFF" />
          <ellipse cx="50" cy="20" rx="22" ry="4" fill="#B7BECE" />

          {/* Highlight */}
          <path
            d="M32 24 C30 33 32 46 36 53 C34 50 33 40 35 24 Z"
            fill="#FFFFFF"
            opacity="0.6"
          />

          {/* Stem */}
          <path d="M46 67 L44 76 L56 76 L54 67 Z" fill="#939BAE" />
          <path d="M47 67 L46 76 L54 76 L53 67 Z" fill="#EBF0F8" />

          {/* Base Stand */}
          <path d="M38 76 L62 76 L66 84 L34 84 Z" fill="url(#silver-base)" />
          <rect x="32" y="84" width="36" height="6" rx="2" fill="#606778" />
          <rect x="33" y="84" width="34" height="2.5" rx="1" fill="#FFFFFF" opacity="0.8" />

          {/* Rank Badge Emblem: "2" */}
          <circle cx="50" cy="42" r="12" fill="#FFFFFF" />
          <circle cx="50" cy="42" r="10.5" fill="#E2E6EE" />
          <text
            x="50"
            y="48"
            textAnchor="middle"
            fill="#4F5868"
            fontSize="16"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
          >
            2
          </text>
        </g>
      </svg>
    );
  }

  // Rank 3: Bronze
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bronze-cup" x1="20" y1="15" x2="80" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5C09B" />
          <stop offset="35%" stopColor="#D9824C" />
          <stop offset="70%" stopColor="#B65B27" />
          <stop offset="100%" stopColor="#87370F" />
        </linearGradient>
        <linearGradient id="bronze-base" x1="35" y1="65" x2="65" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#CF7B46" />
          <stop offset="50%" stopColor="#AA5220" />
          <stop offset="100%" stopColor="#732B09" />
        </linearGradient>
        <filter id="bronze-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#6B2908" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter="url(#bronze-shadow)">
        {/* Left Handle */}
        <path
          d="M26 26 C12 26 10 46 25 52 C27 48 29 45 31 43 C22 39 21 32 28 32 Z"
          fill="#8F3F15"
        />
        <path
          d="M27 28 C15 28 13 44 26 50 C25 46 27 43 29 41 C21 37 21 33 28 33 Z"
          fill="#DF8B57"
        />

        {/* Right Handle */}
        <path
          d="M74 26 C88 26 90 46 75 52 C73 48 71 45 69 43 C78 39 79 32 72 32 Z"
          fill="#8F3F15"
        />
        <path
          d="M73 28 C85 28 87 44 74 50 C75 46 73 43 71 41 C79 37 79 33 72 33 Z"
          fill="#DF8B57"
        />

        {/* Cup Body */}
        <path
          d="M25 20 C25 18 75 18 75 20 L72 48 C70 63 58 68 50 68 C42 68 30 63 28 48 Z"
          fill="url(#bronze-cup)"
        />

        {/* Rim */}
        <ellipse cx="50" cy="20" rx="25" ry="5.5" fill="#FAD1B6" />
        <ellipse cx="50" cy="20" rx="22" ry="4" fill="#B35B29" />

        {/* Highlight */}
        <path
          d="M32 24 C30 33 32 46 36 53 C34 50 33 40 35 24 Z"
          fill="#FFEFE6"
          opacity="0.7"
        />

        {/* Stem */}
        <path d="M46 67 L44 76 L56 76 L54 67 Z" fill="#8C3B12" />
        <path d="M47 67 L46 76 L54 76 L53 67 Z" fill="#F3BF9B" />

        {/* Base Stand */}
        <path d="M38 76 L62 76 L66 84 L34 84 Z" fill="url(#bronze-base)" />
        <rect x="32" y="84" width="36" height="6" rx="2" fill="#612306" />
        <rect x="33" y="84" width="34" height="2.5" rx="1" fill="#FAD1B6" opacity="0.8" />

        {/* Rank Badge Emblem: "3" */}
        <circle cx="50" cy="42" r="12" fill="#FFFFFF" />
        <circle cx="50" cy="42" r="10.5" fill="#F3D1BC" />
        <text
          x="50"
          y="48"
          textAnchor="middle"
          fill="#7C320A"
          fontSize="16"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
        >
          3
        </text>
      </g>
    </svg>
  );
}
