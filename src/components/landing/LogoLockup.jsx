function CrosshairSymbol({ className = '' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="WhatColor logo">
      <rect width="32" height="32" rx="7" fill="#111" />
      <path d="M 16 1.5 A 14.5 14.5 0 0 1 28.56 8.75 L 23.1 11.9 A 8.2 8.2 0 0 0 16 7.8 Z" fill="#FF3B30" />
      <path d="M 28.56 8.75 A 14.5 14.5 0 0 1 28.56 23.25 L 23.1 20.1 A 8.2 8.2 0 0 0 23.1 11.9 Z" fill="#FF9500" />
      <path d="M 28.56 23.25 A 14.5 14.5 0 0 1 16 30.5 L 16 24.2 A 8.2 8.2 0 0 0 23.1 20.1 Z" fill="#FFD60A" />
      <path d="M 16 30.5 A 14.5 14.5 0 0 1 3.44 23.25 L 8.9 20.1 A 8.2 8.2 0 0 0 16 24.2 Z" fill="#30D158" />
      <path d="M 3.44 23.25 A 14.5 14.5 0 0 1 3.44 8.75 L 8.9 11.9 A 8.2 8.2 0 0 0 8.9 20.1 Z" fill="#0A84FF" />
      <path d="M 3.44 8.75 A 14.5 14.5 0 0 1 16 1.5 L 16 7.8 A 8.2 8.2 0 0 0 8.9 11.9 Z" fill="#BF5AF2" />
      <line x1="16" y1="0.6" x2="16" y2="31.4" stroke="white" strokeWidth="2.1" strokeLinecap="round" />
      <line x1="0.6" y1="16" x2="31.4" y2="16" stroke="white" strokeWidth="2.1" strokeLinecap="round" />
      <circle cx="16" cy="16" r="3.4" fill="white" />
    </svg>
  )
}

/** Crisp vector lockup — scales sharply at any size, no raster blur. */
export default function LogoLockup() {
  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative flex items-center justify-center">
        <div
          className="absolute rounded-full animate-spin-slow w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] md:w-[210px] md:h-[210px] pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, #FF3B30, #FF9500, #FFD60A, #30D158, #0A84FF, #BF5AF2, #FF3B30)',
            WebkitMask: 'radial-gradient(circle, transparent 60%, black 60%)',
            mask: 'radial-gradient(circle, transparent 60%, black 60%)',
            opacity: 0.32,
          }}
        />
        <CrosshairSymbol className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 drop-shadow-sm" />
      </div>
      <div className="mt-3 md:mt-4 leading-none font-extrabold tracking-tight text-5xl sm:text-6xl md:text-7xl">
        <span className="text-[#111]">What</span>
        <span className="shimmer-text animate-shimmer">Color</span>
      </div>
      <p className="mt-2 text-[0.6rem] sm:text-xs font-semibold tracking-[0.3em] uppercase text-gray-400">
        See More. Know More.
      </p>
    </div>
  )
}
