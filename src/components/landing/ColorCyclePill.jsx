import { useState, useEffect } from 'react'

import { HERO_CYCLE } from './demoColors'

// Real engine output for real-world things, not hand-picked names.
const COLORS = HERO_CYCLE.map((c) => ({ name: c.result.name, hex: c.hex, thing: c.thing }))

export default function ColorCyclePill() {
  const [index, setIndex]       = useState(0)
  const [prevIndex, setPrevIndex] = useState(null)
  const [flash, setFlash]       = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFlash(true)
      setTimeout(() => setFlash(false), 450)

      const next = (index + 1) % COLORS.length
      setPrevIndex(index)
      setIndex(next)
      setTimeout(() => setPrevIndex(null), 380)
    }, 2600)
    return () => clearInterval(interval)
  }, [index])

  const current = COLORS[index]
  const prev    = prevIndex !== null ? COLORS[prevIndex] : null

  return (
    <div
      className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-light"
      style={{
        transition: 'box-shadow 0.3s ease',
        boxShadow: flash
          ? `0 0 0 3px ${current.hex}28, 0 4px 12px ${current.hex}20`
          : undefined,
      }}
    >
      {/* Dot — bounces + recolors on each change */}
      <div
        key={index}
        className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
        style={{
          backgroundColor: current.hex,
          animation: 'dotBounce 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      />

      {/* Slot-machine text roll */}
      <div className="relative overflow-hidden" style={{ height: '1.75rem', minWidth: '236px' }}>
        {/* Exiting row */}
        {prev && (
          <div
            className="absolute inset-0 flex items-center gap-2 pointer-events-none"
            style={{ animation: 'pillExit 0.32s ease-in both' }}
          >
            <span className="text-base font-semibold text-gray-800 whitespace-nowrap">{prev.name}</span>
            <span className="text-sm text-gray-400 whitespace-nowrap">{prev.thing}</span>
          </div>
        )}

        {/* Entering row */}
        <div
          key={index}
          className="absolute inset-0 flex items-center gap-2"
          style={{ animation: 'pillEnter 0.42s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          <span className="text-base font-semibold text-gray-800 whitespace-nowrap">{current.name}</span>
          <span className="text-sm text-gray-400 whitespace-nowrap">{current.thing}</span>
        </div>
      </div>
    </div>
  )
}
