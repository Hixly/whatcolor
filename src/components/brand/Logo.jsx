import { useMemo } from 'react'
import { ringSegments, TICKS, TICK_WIDTH, CENTER, INK } from '../../brand/mark'

/** The WhatColor mark as inline SVG: crisp at any size, no image request. */
export function WhatColorMark({ size = 48, ink = INK, className = '', title }) {
  const ring = useMemo(() => ringSegments(), [])
  // Numbers are pixels; strings (e.g. "3em") go through CSS so it can scale.
  const dims = typeof size === 'number' ? { width: size, height: size } : { style: { width: size, height: size } }
  return (
    <svg
      viewBox="0 0 100 100"
      {...dims}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {ring.map((s, i) => <path key={i} d={s.d} fill={s.fill} />)}
      {TICKS.map(([x1, y1, x2, y2]) => (
        <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={TICK_WIDTH} strokeLinecap="round" />
      ))}
      <circle cx="50" cy="50" r={CENTER.r} fill="none" stroke={ink} strokeWidth={CENTER.stroke} />
    </svg>
  )
}

/** "WhatColor" with the spectrum across "Color". */
export function WhatColorWordmark({ className = '', dark = false }) {
  return (
    <span className={`font-semibold tracking-tight ${dark ? 'text-white' : 'text-[#1c1c1e]'} ${className}`}>
      What
      <span
        className="bg-clip-text text-transparent"
        style={{ backgroundImage: 'linear-gradient(90deg, #FF3B30, #FF9500 22%, #FFD60A 38%, #30D158 55%, #0A84FF 75%, #BF5AF2)' }}
      >
        Color
      </span>
    </span>
  )
}

/**
 * Mark + wordmark + tagline, stacked. Everything is sized in em, so one
 * font-size on the wrapper scales the whole lockup.
 */
export function WhatColorLockup({ className = '', style }) {
  return (
    <div
      className={`flex flex-col items-center select-none leading-none ${className}`}
      style={style}
      role="img"
      aria-label="WhatColor. See more. Know more."
    >
      <WhatColorMark size="2.9em" />
      <WhatColorWordmark className="mt-[0.28em]" />
      <span className="mt-[0.42em] text-[0.2em] font-medium tracking-[0.42em] text-[#6b6b70] pl-[0.42em] whitespace-nowrap">
        SEE MORE. KNOW MORE.
      </span>
    </div>
  )
}
