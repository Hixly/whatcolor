import { useMemo } from 'react'
import { markParts } from '../../brand/mark'

function Lines({ lines, width, color }) {
  return (
    <g stroke={color} strokeWidth={width} strokeLinecap="round">
      {lines.map(([x1, y1, x2, y2]) => <line key={`${x1}-${y1}-${x2}`} x1={x1} y1={y1} x2={x2} y2={y2} />)}
    </g>
  )
}

/**
 * The WhatColor mark as inline SVG, identical to the in-app reticle (which is
 * drawn with this same component). `centerR` lets the reticle size its center
 * circle to the real sample spot; `weight` thickens strokes at tiny sizes.
 */
export function WhatColorMark({ size = 48, weight = 1, centerR, className = '', title }) {
  const m = useMemo(() => markParts({ weight, centerR }), [weight, centerR])
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
      {m.ring.map((s, i) => <path key={i} d={s.d} fill={s.fill} />)}
      <Lines {...m.ticks} />
      <Lines {...m.tickCores} />
      <circle cx="50" cy="50" r={m.center.r} fill="none" stroke={m.center.color} strokeWidth={m.center.width} />
      <circle cx="50" cy="50" r={m.centerCore.r} fill="none" stroke={m.centerCore.color} strokeWidth={m.centerCore.width} />
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
      <WhatColorMark size="2.9em" className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]" />
      <WhatColorWordmark className="mt-[0.28em]" />
      <span className="mt-[0.42em] text-[0.2em] font-medium tracking-[0.42em] text-[#6b6b70] pl-[0.42em] whitespace-nowrap">
        SEE MORE. KNOW MORE.
      </span>
    </div>
  )
}
