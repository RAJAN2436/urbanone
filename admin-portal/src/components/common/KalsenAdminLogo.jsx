import React from 'react';

export const KalsenAdminLogo = ({ size = "md", showSubtitle = true, className = "" }) => {
  const dimensions = {
    sm: { height: 32, iconSize: 30, fontSize: "text-base", subSize: "text-[9px]" },
    md: { height: 42, iconSize: 38, fontSize: "text-xl", subSize: "text-[10px]" },
    lg: { height: 54, iconSize: 48, fontSize: "text-2xl", subSize: "text-xs" }
  };

  const current = dimensions[size] || dimensions.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official SVG Admin Emblem: Stylized 'K' inside Security Governance Shield */}
      <svg
        width={current.iconSize}
        height={current.iconSize}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform hover:scale-105 duration-300"
      >
        <defs>
          <linearGradient id="adminGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="adminDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
        </defs>

        {/* Outer Shield Container */}
        <path
          d="M 100 12 L 176 42 C 176 115 142 165 100 188 C 58 165 24 115 24 42 Z"
          fill="#fff7ed"
          stroke="#fed7aa"
          strokeWidth="6"
        />

        {/* Speed Streaks on Left */}
        <rect x="36" y="60" width="24" height="7" rx="3.5" fill="#f97316" />
        <rect x="28" y="78" width="32" height="7" rx="3.5" fill="#f97316" />
        <rect x="34" y="96" width="26" height="7" rx="3.5" fill="#f97316" />

        {/* Stylized 'K' Stem */}
        <path
          d="M 85 45 L 108 45 C 110 45 112 46 112 48 L 88 152 C 87 154 85 155 83 155 L 62 155 C 59 155 58 153 59 150 L 81 48 C 82 46 83 45 85 45 Z"
          fill="url(#adminGrad)"
        />

        {/* Top Wing of 'K' */}
        <path
          d="M 108 65 L 155 45 C 158 44 160 47 159 50 L 124 105 L 95 85 Z"
          fill="url(#adminGrad)"
        />

        {/* Bottom Wing of 'K' */}
        <path
          d="M 115 108 L 152 150 C 154 153 152 155 149 155 L 122 155 C 120 155 118 154 116 151 L 86 118 Z"
          fill="url(#adminDark)"
        />

        {/* Security Shield Star / Check Emblem */}
        <g transform="translate(2, -4)">
          <circle cx="106" cy="80" r="14" fill="#ea580c" />
          <path
            d="M 100 80 L 104 84 L 112 76"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      {/* Wordmark Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-['Outfit'] font-black tracking-tight ${current.fontSize} flex items-center`}>
          <span className="text-zinc-950">Kalsen</span>
          <span className="text-[#f97316]">Admin</span>
        </div>
        {showSubtitle && (
          <div className={`font-bold tracking-wide text-zinc-500 mt-1 flex items-center gap-1.5 ${current.subSize}`}>
            <span className="text-[#ea580c]">Command OS</span>
            <span className="w-1 h-1 rounded-full bg-zinc-300" />
            <span>Port 3001</span>
          </div>
        )}
      </div>
    </div>
  );
};
