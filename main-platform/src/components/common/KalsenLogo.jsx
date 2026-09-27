import React from 'react';

export const KalsenLogo = ({ size = "md", showSubtitle = false, className = "" }) => {
  const dimensions = {
    sm: { height: 32, iconSize: 28, fontSize: "text-lg", subSize: "text-[9px]" },
    md: { height: 42, iconSize: 36, fontSize: "text-xl", subSize: "text-[10px]" },
    lg: { height: 56, iconSize: 48, fontSize: "text-2xl", subSize: "text-xs" },
    xl: { height: 72, iconSize: 64, fontSize: "text-3xl", subSize: "text-sm" }
  };

  const current = dimensions[size] || dimensions.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* SVG Icon Symbol: Stylized 'K' with embedded Food Cloche & Speed Lines */}
      <svg
        width={current.iconSize}
        height={current.iconSize}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform hover:scale-105 duration-300"
      >
        <defs>
          <linearGradient id="kOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        {/* Speed Streaks on Left */}
        <rect x="20" y="56" width="34" height="10" rx="5" fill="#f97316" />
        <rect x="8" y="78" width="46" height="10" rx="5" fill="#f97316" />
        <rect x="18" y="100" width="36" height="10" rx="5" fill="#f97316" />
        <rect x="28" y="122" width="26" height="10" rx="5" fill="#f97316" />

        {/* Vertical & Left Slanted Stem of 'K' */}
        <path
          d="M 85 24 L 115 24 C 117 24 119 25 119 27 L 85 174 C 84 176 82 177 80 177 L 55 177 C 52 177 50 175 51 172 L 80 27 C 81 25 83 24 85 24 Z"
          fill="url(#kOrangeGrad)"
        />

        {/* Top Diagonal Wing of 'K' */}
        <path
          d="M 115 48 L 180 24 C 183 23 186 26 184 29 L 140 102 L 105 76 Z"
          fill="url(#kOrangeGrad)"
        />

        {/* Bottom Charcoal Diagonal Leg of 'K' */}
        <path
          d="M 125 106 L 176 172 C 178 175 176 178 172 178 L 138 178 C 135 178 133 177 131 174 L 92 120 Z"
          fill="#18181b"
        />

        {/* Food Cloche Dome in Center */}
        <g>
          {/* Handle Knob */}
          <circle cx="106" cy="62" r="5" fill="#ffffff" />
          
          {/* Cloche Dome */}
          <path
            d="M 78 98 C 78 74 90 68 106 68 C 122 68 134 74 134 98 Z"
            fill="#ffffff"
          />
          
          {/* Dome Inner Shadow / Shine */}
          <path
            d="M 116 73 C 126 77 130 84 131 96"
            stroke="#f97316"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cloche Plate Rim */}
          <rect x="70" y="98" width="72" height="7" rx="3.5" fill="#ffffff" />
        </g>
      </svg>

      {/* Wordmark Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-['Outfit'] font-black tracking-tight ${current.fontSize} flex items-center`}>
          <span className="text-[#18181b]">Kalsen</span>
          <span className="text-[#f97316]">One</span>
        </div>
        {showSubtitle && (
          <div className={`font-medium tracking-wide text-zinc-500 mt-1 flex items-center gap-1.5 ${current.subSize}`}>
            <span>Food</span>
            <span className="w-1 h-1 rounded-full bg-[#f97316]" />
            <span>Grocery</span>
            <span className="w-1 h-1 rounded-full bg-[#f97316]" />
            <span>More</span>
          </div>
        )}
      </div>
    </div>
  );
};
