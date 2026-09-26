import { forwardRef, useMemo } from 'react'
import { ringSegments } from '../../brand/mark'

// The WhatColor reticle: the logo's spectrum ring with a hollow center whose
// circle is exactly the area being sampled (the logo's center ring, live).

const Reticle = forwardRef(function Reticle({ size = 92, spot = 36, color = null, pulseKey = 0, breathe = false, ringOpacity = 1 }, ref) {
  const ring = useMemo(() => ringSegments({ outer: 46, inner: 36 }), [])

  // Keep the sample circle comfortably inside the ring.
  const outer = Math.max(size, spot * 1.9)
  const spotR = Math.min((spot / outer) * 50, 30)

  return (
    <div
      ref={ref}
      className="relative flex items-center justify-center pointer-events-none"
      style={{ width: outer, height: outer }}
    >
      {color && (
        <span
          key={pulseKey}
          className="absolute rounded-full animate-lockPulse"
          style={{
            width: outer * 1.08,
            height: outer * 1.08,
            border: `2px solid ${color}`,
            boxShadow: `0 0 14px 1px ${color}80`,
          }}
        />
      )}
      <svg
        viewBox="0 0 100 100"
        width={outer}
        height={outer}
        className={`drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] ${breathe ? 'animate-breathe' : ''}`}
        aria-hidden="true"
      >
        <g opacity={ringOpacity}>
          {ring.map((s, i) => <path key={i} d={s.d} fill={s.fill} />)}
        </g>
        {/* Crosshair ticks, like the logo */}
        <g stroke="#111" strokeWidth="4.5" strokeLinecap="round">
          <line x1="50" y1="1.5" x2="50" y2="17" />
          <line x1="50" y1="83" x2="50" y2="98.5" />
          <line x1="1.5" y1="50" x2="17" y2="50" />
          <line x1="83" y1="50" x2="98.5" y2="50" />
        </g>
        <g stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
          <line x1="50" y1="3" x2="50" y2="15.5" />
          <line x1="50" y1="84.5" x2="50" y2="97" />
          <line x1="3" y1="50" x2="15.5" y2="50" />
          <line x1="84.5" y1="50" x2="97" y2="50" />
        </g>
        {/* Sample area: exactly what gets measured */}
        <circle cx="50" cy="50" r={spotR} fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="3.2" />
        <circle cx="50" cy="50" r={spotR} fill="none" stroke="#fff" strokeWidth="1.5" />
      </svg>
    </div>
  )
})

export default Reticle
