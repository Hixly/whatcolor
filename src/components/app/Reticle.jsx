import { forwardRef } from 'react'
import { WhatColorMark } from '../brand/Logo'

// The live reticle is the WhatColor logo itself. Its center circle is sized
// to exactly the area being sampled.
const Reticle = forwardRef(function Reticle({ size = 92, spot = 36, color = null, pulseKey = 0, breathe = false }, ref) {
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
      <WhatColorMark
        size={outer}
        centerR={spotR}
        className={`drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] ${breathe ? 'animate-breathe' : ''}`}
      />
    </div>
  )
})

export default Reticle
