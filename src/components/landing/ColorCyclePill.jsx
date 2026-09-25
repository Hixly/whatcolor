import { useState, useEffect } from 'react'

const COLORS = [
  { name: 'Crimson Red',  hex: '#FF3B30' },
  { name: 'Ocean Blue',   hex: '#0A84FF' },
  { name: 'Golden Hour',  hex: '#FFD60A' },
  { name: 'Sage Green',   hex: '#30D158' },
  { name: 'Royal Purple', hex: '#BF5AF2' },
  { name: 'Sunflower',    hex: '#FF9500' },
]

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
      <div className="relative overflow-hidden" style={{ height: '1.75rem', minWidth: '172px' }}>
        {/* Exiting row */}
        {prev && (
          <div
            className="absolute inset-0 flex items-center gap-2 pointer-events-none"
            style={{ animation: 'pillExit 0.32s ease-in both' }}
          >
            <span className="text-base font-semibold text-gray-800 whitespace-nowrap">{prev.name}</span>
            <span className="font-mono text-sm text-gray-400 whitespace-nowrap">{prev.hex}</span>
          </div>
        )}

        {/* Entering row */}
        <div
          key={index}
          className="absolute inset-0 flex items-center gap-2"
          style={{ animation: 'pillEnter 0.42s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          <span className="text-base font-semibold text-gray-800 whitespace-nowrap">{current.name}</span>
          <span className="font-mono text-sm text-gray-400 whitespace-nowrap">{current.hex}</span>
        </div>
      </div>
    </div>
  )
}
