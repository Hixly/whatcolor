import { forwardRef, useMemo } from 'react'

// The WhatColor reticle: the brand's rainbow ring, with a hollow center whose
// circle is exactly the area being sampled. The old PNG had a solid dot right
// over the spot it was measuring.
const SEGMENTS = 36

function arc(cx, cy, r0, r1, a0, a1) {
  const p = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  const [x0, y0] = p(r1, a0), [x1, y1] = p(r1, a1)
  const [x2, y2] = p(r0, a1), [x3, y3] = p(r0, a0)
  return `M${x0} ${y0}A${r1} ${r1} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 0 0 ${x3} ${y3}Z`
}

const Reticle = forwardRef(function Reticle({ size = 92, spot = 36, color = null, pulseKey = 0, breathe = false, ringOpacity = 1 }, ref) {
  const ring = useMemo(() => {
    const out = []
    for (let i = 0; i < SEGMENTS; i++) {
      // Start at the top and go clockwise, red → orange → ... → magenta.
      const a0 = -Math.PI / 2 + (i / SEGMENTS) * Math.PI * 2
      const a1 = a0 + (Math.PI * 2) / SEGMENTS + 0.012
      out.push({ d: arc(50, 50, 36, 46, a0, a1), fill: `hsl(${(i * 360) / SEGMENTS}, 92%, 56%)` })
    }
    return out
  }, [])

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
