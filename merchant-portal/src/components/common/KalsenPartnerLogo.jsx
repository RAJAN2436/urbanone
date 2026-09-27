import React from 'react';

export const KalsenPartnerLogo = ({ size = "md", showSubtitle = true, className = "" }) => {
  const dimensions = {
    sm: { height: 32, iconSize: 30, fontSize: "text-base", subSize: "text-[9px]" },
    md: { height: 42, iconSize: 38, fontSize: "text-xl", subSize: "text-[10px]" },
    lg: { height: 54, iconSize: 48, fontSize: "text-2xl", subSize: "text-xs" }
  };

  const current = dimensions[size] || dimensions.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official SVG Partner Icon: Stylized 'K' with Storefront & Chef Canopy */}
      <svg
        width={current.iconSize}
        height={current.iconSize}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform hover:scale-105 duration-300"
      >
        <defs>
          <linearGradient id="partnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="partnerDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#18181b" />
          </linearGradient>
        </defs>

        {/* Outer Glow Hexagon / Rounded Shield */}
        <rect x="12" y="12" width="176" height="176" rx="44" fill="#fff7ed" stroke="#fed7aa" strokeWidth="6" />

        {/* Speed Streaks on Left */}
        <rect x="32" y="58" width="28" height="8" rx="4" fill="#f97316" />
        <rect x="22" y="78" width="38" height="8" rx="4" fill="#f97316" />
        <rect x="30" y="98" width="30" height="8" rx="4" fill="#f97316" />

        {/* Vertical & Left Slanted Stem of 'K' */}
        <path
          d="M 82 34 L 108 34 C 110 34 112 35 112 37 L 85 160 C 84 162 82 163 80 163 L 58 163 C 55 163 54 161 55 158 L 78 37 C 79 35 80 34 82 34 Z"
          fill="url(#partnerGrad)"
        />

        {/* Top Diagonal Wing of 'K' */}
        <path
          d="M 108 55 L 165 34 C 168 33 171 36 169 39 L 130 102 L 98 78 Z"
          fill="url(#partnerGrad)"
        />

        {/* Bottom Diagonal Leg of 'K' */}
        <path
          d="M 118 106 L 162 160 C 164 163 162 165 159 165 L 128 165 C 126 165 124 164 122 161 L 88 118 Z"
          fill="url(#partnerDarkGrad)"
        />

        {/* Storefront Awning Emblem */}
        <g transform="translate(10, 10)">
          <path
            d="M 85 85 L 135 85 L 142 105 L 78 105 Z"
            fill="#ea580c"
          />
          <path
            d="M 90 85 L 98 105 M 105 85 L 112 105 M 120 85 L 126 105"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <rect x="80" y="105" width="60" height="4" rx="2" fill="#ffffff" />
        </g>
      </svg>

      {/* Wordmark Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-['Outfit'] font-black tracking-tight ${current.fontSize} flex items-center`}>
          <span className="text-zinc-950">Kalsen</span>
          <span className="text-[#f97316]">Partner</span>
        </div>
        {showSubtitle && (
          <div className={`font-bold tracking-wide text-zinc-500 mt-1 flex items-center gap-1.5 ${current.subSize}`}>
            <span className="text-[#ea580c]">Merchant OS</span>
            <span className="w-1 h-1 rounded-full bg-zinc-300" />
            <span>Port 3000</span>
          </div>
        )}
      </div>
    </div>
  );
};
