import { useState, useEffect } from 'react'
import { HomeIcon, SettingsIcon, BookmarkIcon } from '../ui/Icons'

/** Must match the crosshair CSS transition duration. */
export const CROSSHAIR_TRANSITION_MS = 1100

/** Full loop: travel time + dwell time while label matches the patch under the reticle. */
export const DEMO_CYCLE_MS = 2200

const DEMO_COLORS = [
  { x: 30, y: 28, name: 'Terracotta', hex: '#D8552F', rgb: '216·85·47' },
  { x: 70, y: 25, name: 'Ocean Blue', hex: '#0A84FF', rgb: '10·132·255' },
  { x: 71, y: 52, name: 'Sage Green', hex: '#30D158', rgb: '48·209·88' },
  { x: 31, y: 54, name: 'Golden Hour', hex: '#FFD60A', rgb: '255·214·10' },
  { x: 50, y: 40, name: 'Royal Purple', hex: '#BF5AF2', rgb: '191·90·242' },
]

export default function PhoneMockup({ className = '' }) {
  const [targetIndex, setTargetIndex] = useState(0)
  const [displayIndex, setDisplayIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTargetIndex(i => (i + 1) % DEMO_COLORS.length)
    }, DEMO_CYCLE_MS)
    return () => clearInterval(interval)
  }, [])

  // Keep the color card on the previous swatch while the reticle is in motion.
  useEffect(() => {
    if (targetIndex === displayIndex) return undefined
    const timeout = setTimeout(() => setDisplayIndex(targetIndex), CROSSHAIR_TRANSITION_MS)
    return () => clearTimeout(timeout)
  }, [targetIndex, displayIndex])

  const target = DEMO_COLORS[targetIndex]
  const display = DEMO_COLORS[displayIndex]

  return (
    <div className={`relative mx-auto ${className}`} style={{ width: 268 }}>
      <div
        className="relative rounded-[46px] bg-[#0b0b0c] p-[10px] border border-white/10"
        style={{
          boxShadow: '0 40px 80px -28px rgba(0,0,0,0.55), 0 8px 24px -12px rgba(0,0,0,0.4)',
        }}
      >
        <div className="relative rounded-[38px] overflow-hidden" style={{ aspectRatio: '9 / 19.3' }}>
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(120% 100% at 50% 30%, #2b2723 0%, #141110 100%)' }}
          />

          {DEMO_COLORS.map((color, i) => (
            <div
              key={i}
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${color.x}%`,
                top: `${color.y}%`,
                width: '26%',
                aspectRatio: '1',
                background: color.hex,
                filter: 'blur(9px)',
                opacity: 0.92,
              }}
            />
          ))}

          <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[78px] h-[22px] bg-black rounded-full z-30" />
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/45 to-transparent z-10" />

          <div className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/70">
            <HomeIcon size={14} />
          </div>
          <div className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/70">
            <SettingsIcon size={14} />
          </div>

          <div
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              transition: `left ${CROSSHAIR_TRANSITION_MS}ms cubic-bezier(0.65, 0, 0.35, 1), top ${CROSSHAIR_TRANSITION_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
            }}
          >
            <div className="relative flex items-center justify-center">
              <span
                className="absolute rounded-full animate-lock-pulse"
                style={{
                  width: 58,
                  height: 58,
                  border: `2px solid ${target.hex}`,
                  boxShadow: `0 0 10px 1px ${target.hex}80`,
                }}
              />
              <img
                src="/logo-symbol-transparent.png"
                srcSet="/logo-symbol-transparent.png 1x, /logo-symbol-transparent@2x.png 2x"
                alt=""
                className="h-[46px] w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                draggable={false}
              />
            </div>
          </div>

          <div className="absolute inset-x-2 z-20" style={{ bottom: 64 }}>
            <div
              className="rounded-2xl border border-white/10 backdrop-blur-xl px-3 py-2.5"
              style={{
                background: `linear-gradient(180deg, ${display.hex}2e 0%, rgba(15,15,15,0.92) 60%)`,
                boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.12)',
                transition: 'background 0.45s ease',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-[10px] shrink-0"
                  style={{
                    backgroundColor: display.hex,
                    boxShadow: `0 0 0 1px rgba(255,255,255,0.12), 0 3px 12px 0 ${display.hex}8c`,
                    transition: 'background-color 0.45s ease, box-shadow 0.45s ease',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-[13px] leading-tight">{display.name}</p>
                  <p className="font-mono text-[9px] text-white/60 leading-tight mt-0.5">
                    {display.hex} · {display.rgb}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/70">
                  <BookmarkIcon size={12} />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-black/35 backdrop-blur-xl border border-white/10">
            <span className="w-7 h-7 rounded-full bg-white/5" />
            <span className="w-10 h-10 rounded-full bg-white border-2 border-white/60" />
            <span className="w-7 h-7 rounded-full bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  )
}
