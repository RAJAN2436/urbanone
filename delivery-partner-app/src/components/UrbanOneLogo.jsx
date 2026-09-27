import React from 'react';

export const UrbanOneLogo = ({ size = 'md', variant = 'full', className = '', light = false }) => {
  const sizeMap = {
    xs: { icon: 26, font: 'text-sm', sub: 'text-[8px]' },
    sm: { icon: 34, font: 'text-base', sub: 'text-[9px]' },
    md: { icon: 46, font: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 60, font: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 76, font: 'text-3xl', sub: 'text-sm' }
  };
  const s = sizeMap[size] || sizeMap.md;

  const IconSvg = (
    <svg
      width={s.icon}
      height={s.icon}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
    >
      <defs>
        <linearGradient id="uoGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="uoDarkGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#27272A" />
          <stop offset="100%" stopColor="#09090B" />
        </linearGradient>
      </defs>

      {/* Rounded App Icon Background */}
      <rect x="10" y="10" width="180" height="180" rx="46" fill="url(#uoDarkGradReact)" />
      <rect x="11" y="11" width="178" height="178" rx="45" stroke="#3F3F46" strokeWidth="2" fill="none" opacity="0.4" />

      {/* Speed Trails on Top Left */}
      <rect x="36" y="44" width="22" height="6" rx="3" fill="#F97316" opacity="0.85" />
      <rect x="28" y="58" width="30" height="6" rx="3" fill="#FB923C" opacity="0.95" />

      {/* Modern 'U' Outer Curved Hull */}
      <path
        d="M 52 52 L 76 52 C 78.5 52 80 54 80 57 L 80 114 C 80 134 94 148 114 148 C 134 148 148 134 148 114 L 148 76 C 148 73 150 71 153 71 L 172 71 C 174.5 71 176 73 176 76 L 176 114 C 176 148 148 174 114 174 C 80 174 52 148 52 114 L 52 57 C 52 54 53.5 52 56 52 Z"
        fill="url(#uoGradReact)"
      />

      {/* Central Bold '1' Apex inside U */}
      <path
        d="M 104 50 L 126 34 C 128 32.5 131 34 131 37 L 131 124 C 131 126.5 129 128 126.5 128 L 110 128 C 107.5 128 106 126.5 106 124 L 106 66 L 98 72 C 96 73.5 93 72.5 93 70 L 93 58 C 93 56 94 54.5 96 53.5 Z"
        fill="#FFFFFF"
      />

      {/* Fast Express Delivery Spark / Chevron */}
      <polygon points="144,38 168,26 158,54 174,54 140,94 148,64 134,64" fill="#FBBF24" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{IconSvg}</div>;
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {IconSvg}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-['Outfit'] font-black tracking-tight ${s.font} flex items-center`}>
          <span className={light ? 'text-white' : 'text-zinc-900'}>Urban</span>
          <span className="text-[#F97316]">One</span>
        </div>
        <div className={`font-bold tracking-wider text-zinc-400 mt-1 flex items-center gap-1 uppercase ${s.sub}`}>
          <span>Fleet Partner</span>
        </div>
      </div>
    </div>
  );
};
