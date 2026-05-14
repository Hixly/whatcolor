import { useState, useEffect } from 'react'

const COLORS = [
  { name: 'Crimson Red', hex: '#FF3B30' },
  { name: 'Ocean Blue', hex: '#0A84FF' },
  { name: 'Golden Hour', hex: '#FFD60A' },
  { name: 'Sage Green', hex: '#30D158' },
  { name: 'Royal Purple', hex: '#BF5AF2' },
  { name: 'Sunflower', hex: '#FF9500' },
]

export default function ColorCyclePill() {
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIndex(i => (i + 1) % COLORS.length)
        setFading(false)
      }, 280)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  const color = COLORS[index]

  return (
    <div
      className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-gray-200 bg-white shadow-md text-base font-semibold text-gray-800"
      style={{ transition: 'opacity 0.28s ease', opacity: fading ? 0 : 1 }}
    >
      <div
        className="w-4 h-4 rounded-full flex-shrink-0 shadow"
        style={{ backgroundColor: color.hex }}
      />
      <span>{color.name}</span>
      <span className="font-mono text-sm font-normal text-gray-400">{color.hex}</span>
    </div>
  )
}
