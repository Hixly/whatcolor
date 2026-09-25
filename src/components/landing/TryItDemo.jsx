import { useState, useRef, useEffect, useMemo, useCallback, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { WALL, TOUR } from './demoColors'
import { simulateRgb } from '../../engine/cvd'
import { identify } from '../../engine/identify'
import { toHex, relativeLuminance } from '../../engine/colorMath'
import Reticle from '../app/Reticle'
import { useInView } from '../../hooks/useInView'
import { CameraIcon, WarningIcon } from '../ui/Icons'

const MODES = [
  { key: 'none', label: 'Typical', long: 'typical color vision' },
  { key: 'protanopia', label: 'Protan', long: 'protan color vision' },
  { key: 'deuteranopia', label: 'Deutan', long: 'deutan color vision' },
  { key: 'tritanopia', label: 'Tritan', long: 'tritan color vision' },
]

const TOUR_MS = 1900

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function TryItDemo() {
  const [sectionRef, inView] = useInView({ threshold: 0.25 })
  const wallRef = useRef(null)
  const chipRefs = useRef([])
  const [active, setActive] = useState(TOUR[0])
  const [mode, setMode] = useState('none')
  const [touring, setTouring] = useState(true)
  const [dragPos, setDragPos] = useState(null) // free reticle position while dragging
  const [centers, setCenters] = useState([])
  const tourStep = useRef(0)

  // Where each chip's center sits inside the wall, for the reticle.
  const measure = useCallback(() => {
    const wall = wallRef.current
    if (!wall) return
    const wr = wall.getBoundingClientRect()
    setCenters(chipRefs.current.map((el) => {
      if (!el) return { x: 0, y: 0 }
      const r = el.getBoundingClientRect()
      return { x: r.left - wr.left + r.width / 2, y: r.top - wr.top + r.height / 2 }
    }))
  }, [])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (wallRef.current) ro.observe(wallRef.current)
    return () => ro.disconnect()
  }, [measure])

  // Idle tour: glide across the wall until the visitor takes over.
  useEffect(() => {
    if (!touring || !inView || prefersReducedMotion()) return undefined
    const t = setInterval(() => {
      tourStep.current = (tourStep.current + 1) % TOUR.length
      setActive(TOUR[tourStep.current])
    }, TOUR_MS)
    return () => clearInterval(t)
  }, [touring, inView])

  const shown = useMemo(
    () => WALL.map((c) => {
      const s = mode === 'none' ? c.rgb : simulateRgb(c.rgb, mode)
      const hex = toHex(s.r, s.g, s.b)
      return { hex, dark: relativeLuminance(s.r, s.g, s.b) < 0.28 }
    }),
    [mode],
  )

  const chip = WALL[active]
  // The name is always what the color really is; the heads-up is for the
  // selected type of color vision.
  const result = useMemo(
    () => identify(chip.rgb.r, chip.rgb.g, chip.rgb.b, { profile: mode }),
    [chip, mode],
  )

  const chipAt = (clientX, clientY) => {
    const el = document.elementFromPoint(clientX, clientY)?.closest?.('[data-chip]')
    return el ? Number(el.dataset.chip) : null
  }

  function onPointerDown(e) {
    setTouring(false)
    if (e.pointerType !== 'mouse') e.currentTarget.setPointerCapture?.(e.pointerId)
    track(e)
  }
  function track(e) {
    const wall = wallRef.current
    if (!wall) return
    const wr = wall.getBoundingClientRect()
    setDragPos({ x: e.clientX - wr.left, y: e.clientY - wr.top })
    const i = chipAt(e.clientX, e.clientY)
    if (i != null) setActive(i)
  }
  function onPointerMove(e) {
    // Mouse: follow on hover. Touch/pen: follow while pressed.
    if (e.pointerType === 'mouse' || e.buttons) {
      setTouring(false)
      track(e)
    }
  }

  const pos = dragPos ?? centers[active] ?? { x: 0, y: 0 }
  const modeInfo = MODES.find((m) => m.key === mode)

  return (
    <section id="try" ref={sectionRef} className="px-4 sm:px-6 py-20 md:py-24 max-w-5xl mx-auto scroll-mt-20">
      <div className="text-center mb-10 md:mb-12">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Try it right here</p>
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-[1.08]">
          Drag across real colors.
        </h2>
        <p className="mt-4 text-gray-500 text-base md:text-lg font-light max-w-xl mx-auto leading-relaxed">
          Every name below comes from the same engine as the app. Then flip the view to see the wall the
          way colorblind eyes do.
        </p>
      </div>

      {/* Camera-style frame */}
      <div
        className="relative rounded-[28px] md:rounded-[34px] bg-[#0b0b0c] p-2 md:p-2.5 border border-black/10"
        style={{ boxShadow: '0 40px 90px -40px rgba(0,0,0,0.55), 0 10px 30px -18px rgba(0,0,0,0.35)' }}
      >
        <div
          ref={wallRef}
          className="relative rounded-[22px] md:rounded-[26px] overflow-hidden bg-[#141414] touch-none select-none cursor-crosshair"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => setDragPos(null)}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') setDragPos(null) }}
        >
          <div className="grid grid-cols-4 md:grid-cols-6 gap-1.5 md:gap-2 p-1.5 md:p-2 pb-[118px] md:pb-[124px]">
            {WALL.map((c, i) => (
              <button
                key={i}
                ref={(el) => { chipRefs.current[i] = el }}
                data-chip={i}
                type="button"
                onFocus={() => { setTouring(false); setDragPos(null); setActive(i) }}
                aria-label={`${c.thing}: ${c.result.name}`}
                className={`relative aspect-[4/3] md:aspect-[5/4] rounded-xl md:rounded-2xl transition-[background-color,transform,box-shadow] duration-500 ease-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${active === i ? 'scale-[1.03]' : ''}`}
                style={{
                  backgroundColor: shown[i].hex,
                  boxShadow: active === i
                    ? 'inset 0 0 0 2px rgba(255,255,255,0.85), 0 8px 24px -8px rgba(0,0,0,0.6)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -8px 16px -10px rgba(0,0,0,0.35)',
                }}
              >
                <span
                  className={`absolute left-2 bottom-1.5 text-[10px] md:text-[11px] font-medium tracking-wide ${shown[i].dark ? 'text-white/70' : 'text-black/55'}`}
                >
                  {c.thing}
                </span>
              </button>
            ))}
          </div>

          {/* Reticle */}
          {centers.length > 0 && (
            <div
              className="absolute pointer-events-none z-10"
              style={{
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
                transition: dragPos ? 'none' : 'left 0.75s cubic-bezier(0.65,0,0.35,1), top 0.75s cubic-bezier(0.65,0,0.35,1)',
              }}
            >
              <Reticle size={74} spot={20} color={shown[active].hex} pulseKey={`${active}-${mode}`} />
            </div>
          )}

          {/* Result card, same shape as the app's */}
          <div className="absolute inset-x-2 md:inset-x-3 bottom-2 md:bottom-3 z-20 pointer-events-none">
            <div
              className="rounded-2xl border border-white/[0.09] backdrop-blur-xl px-4 py-3"
              style={{
                background: `linear-gradient(180deg, ${shown[active].hex}26 0%, rgba(15,15,15,0.93) 62%)`,
                transition: 'background 0.5s ease',
              }}
              aria-live="polite"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 md:w-[52px] md:h-[52px] rounded-[14px] shrink-0 transition-colors duration-500"
                  style={{ backgroundColor: shown[active].hex, boxShadow: `0 0 0 1px rgba(255,255,255,0.12), 0 4px 18px 0 ${shown[active].hex}80` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-[19px] md:text-[21px] leading-tight truncate">{result.name}</p>
                  <p className="mt-0.5 text-[12px] text-white/55 truncate">
                    <span className="text-white/80 font-medium">{result.family}</span>
                    <span className="mx-1.5 text-white/25">·</span>
                    <span className="font-mono">{chip.hex.toUpperCase()}</span>
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[12.5px] leading-snug truncate">
                {result.confusion ? (
                  <span className="text-amber-300/90">
                    <WarningIcon size={12} className="inline -mt-0.5 mr-1" />
                    {result.confusion}
                  </span>
                ) : (
                  <span className="text-white/60">{result.description}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vision toggle */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <div role="radiogroup" aria-label="See the wall as" className="inline-flex p-1 rounded-full glass-light">
          {MODES.map((m) => (
            <button
              key={m.key}
              role="radio"
              aria-checked={mode === m.key}
              onClick={() => setMode(m.key)}
              className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ease-spring active:scale-95 ${
                mode === m.key ? 'bg-[#111] text-white raised-dark' : 'text-gray-600 hover:text-gray-900 hover:bg-black/[0.05]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 font-light text-center max-w-lg min-h-[2.5rem] leading-relaxed">
          {mode === 'none'
            ? 'Showing the wall as most people see it. Pick a type above to see it through colorblind eyes.'
            : `Roughly how the wall looks with ${modeInfo.long}. Chips that now look alike are the ones you could mix up. The name still tells you what is really there.`}
        </p>
        <Link
          to="/app"
          className="group/cta mt-1 inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#111] text-white font-semibold rounded-full raised-dark hover:bg-black hover:-translate-y-0.5 transition-all duration-200 ease-spring active:scale-[0.97] text-sm"
        >
          <CameraIcon size={17} className="transition-transform duration-300 ease-spring group-hover/cta:rotate-[-8deg] group-hover/cta:scale-110" />
          Now try it on real things
        </Link>
      </div>
    </section>
  )
}
