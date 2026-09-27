import React from 'react';

export const UrbanOneAdminLogo = ({ size = "md", showSubtitle = true, className = "", light = false }) => {
  const dimensions = {
    sm: { height: 32, iconSize: 30, fontSize: "text-base", subSize: "text-[9px]" },
    md: { height: 42, iconSize: 38, fontSize: "text-xl", subSize: "text-[10px]" },
    lg: { height: 54, iconSize: 48, fontSize: "text-2xl", subSize: "text-xs" }
  };

  const current = dimensions[size] || dimensions.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official UrbanOne Admin SVG Icon */}
      <svg
        width={current.iconSize}
        height={current.iconSize}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform hover:scale-105 duration-300 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="uoAdminGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="uoDarkGradAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#27272A" />
            <stop offset="100%" stopColor="#09090B" />
          </linearGradient>
        </defs>

        {/* Rounded Squircle Background */}
        <rect x="10" y="10" width="180" height="180" rx="46" fill="url(#uoDarkGradAdmin)" />
        <rect x="11" y="11" width="178" height="178" rx="45" stroke="#A855F7" strokeWidth="2" fill="none" opacity="0.4" />

        {/* Speed Trails */}
        <rect x="36" y="44" width="22" height="6" rx="3" fill="#F97316" opacity="0.85" />
        <rect x="28" y="58" width="30" height="6" rx="3" fill="#FB923C" opacity="0.95" />

        {/* 'U' Outer Curved Hull */}
        <path
          d="M 52 52 L 76 52 C 78.5 52 80 54 80 57 L 80 114 C 80 134 94 148 114 148 C 134 148 148 134 148 114 L 148 76 C 148 73 150 71 153 71 L 172 71 C 174.5 71 176 73 176 76 L 176 114 C 176 148 148 174 114 174 C 80 174 52 148 52 114 L 52 57 C 52 54 53.5 52 56 52 Z"
          fill="url(#uoAdminGrad)"
        />

        {/* Central Bold '1' Apex inside U */}
        <path
          d="M 104 50 L 126 34 C 128 32.5 131 34 131 37 L 131 124 C 131 126.5 129 128 126.5 128 L 110 128 C 107.5 128 106 126.5 106 124 L 106 66 L 98 72 C 96 73.5 93 72.5 93 70 L 93 58 C 93 56 94 54.5 96 53.5 Z"
          fill="#FFFFFF"
        />

        {/* Fast Express Spark */}
        <polygon points="144,38 168,26 158,54 174,54 140,94 148,64 134,64" fill="#FBBF24" />
      </svg>

      {/* Wordmark Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-['Outfit'] font-black tracking-tight ${current.fontSize} flex items-center gap-1.5`}>
          <span className={light ? "text-white" : "text-zinc-950"}>Urban</span>
          <span className="text-[#f97316]">One</span>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 border border-orange-200">
            Admin Panel
          </span>
        </div>
        {showSubtitle && (
          <div className={`font-bold tracking-wide text-zinc-500 mt-1 flex items-center gap-1.5 ${current.subSize}`}>
            <span className="text-[#ea580c] font-semibold">HQ Operations</span>
            <span className="w-1 h-1 rounded-full bg-zinc-300" />
            <span>Master Console</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const UrbanAdminLogo = UrbanOneAdminLogo;
export default UrbanOneAdminLogo;
