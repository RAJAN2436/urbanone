import React from 'react';

export const DeliveryEmblem = ({ size = 120, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <defs>
        <linearGradient id="emblemOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>

      {/* Large Stylized 'K' in Charcoal & Orange */}
      <path
        d="M 55 35 L 85 35 L 60 145 L 35 145 Z"
        fill="#18181b"
      />
      <path
        d="M 80 35 L 140 35 L 85 105 L 70 85 Z"
        fill="url(#emblemOrangeGrad)"
      />
      <path
        d="M 75 90 L 135 145 L 105 145 L 58 105 Z"
        fill="#18181b"
      />

      {/* Speed Trails behind cargo box */}
      <rect x="25" y="112" width="38" height="8" rx="4" fill="#f97316" />
      <rect x="15" y="125" width="46" height="8" rx="4" fill="#f97316" />
      <rect x="26" y="137" width="32" height="8" rx="4" fill="#f97316" />

      {/* Scooter Delivery Cargo Box */}
      <rect
        x="65"
        y="98"
        width="45"
        height="32"
        rx="6"
        fill="url(#emblemOrangeGrad)"
      />
      <rect x="70" y="106" width="35" height="4" rx="2" fill="#ffffff" opacity="0.6" />

      {/* Express Scooter Body */}
      {/* Chassis & Seat */}
      <path
        d="M 75 140 Q 95 130 115 134 L 138 120 C 142 118 148 122 146 127 L 135 152 L 120 152 Z"
        fill="#18181b"
      />

      {/* Front Fairing & Handlebars */}
      <path
        d="M 130 102 L 145 98 C 148 97 150 100 148 103 L 136 128 L 128 126 Z"
        fill="#18181b"
      />
      {/* Scooter Headlight */}
      <circle cx="150" cy="103" r="4.5" fill="#f97316" />

      {/* Mudguards */}
      <path
        d="M 72 135 C 72 128 92 128 105 138 L 100 144 C 90 137 78 138 78 144 Z"
        fill="#18181b"
      />
      <path
        d="M 140 135 C 145 125 170 128 174 145 L 165 147 C 160 136 148 134 144 140 Z"
        fill="url(#emblemOrangeGrad)"
      />

      {/* Back Wheel with Orange Rim */}
      <circle cx="95" cy="156" r="18" fill="#18181b" />
      <circle cx="95" cy="156" r="12" fill="#f97316" />
      <circle cx="95" cy="156" r="6" fill="#ffffff" />

      {/* Front Wheel with Orange Rim */}
      <circle cx="160" cy="156" r="16" fill="#18181b" />
      <circle cx="160" cy="156" r="10.5" fill="#f97316" />
      <circle cx="160" cy="156" r="5" fill="#ffffff" />

      {/* Geolocation Map Pin on Top Right */}
      <g transform="translate(135, 52)">
        <path
          d="M 16 0 C 7.16 0 0 7.16 0 16 C 0 28 16 44 16 44 C 16 44 32 28 32 16 C 32 7.16 24.84 0 16 0 Z"
          fill="url(#emblemOrangeGrad)"
        />
        <circle cx="16" cy="16" r="7" fill="#ffffff" />
      </g>
    </svg>
  );
};
