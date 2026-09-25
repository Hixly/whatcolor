import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CameraIcon } from '../ui/Icons'
import PhoneMockup from './PhoneMockup'

const STEPS = [
  { n: '01', accent: '#FF3B30', title: 'Identify any color, live', desc: 'Point your camera and read colors in real time — exact hex, RGB, and a plain-language name.' },
  { n: '02', accent: '#0A84FF', title: 'Made for color blindness', desc: 'Get a warning when a shade is in your confusion zone, and see how others perceive it.' },
  { n: '03', accent: '#30D158', title: 'Keep every color you find', desc: 'Save, label, and export your whole palette as a PNG sheet or JSON.' },
]

const PHONE_W = 268
const PHONE_H = 550
const M_SCALE = 0.62

function StepText({ step, active }) {
  return (
    <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-35 translate-y-1'}`}>
      <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest mb-3" style={{ color: active ? step.accent : '#9ca3af' }}>
        <span className="w-6 h-px" style={{ background: active ? step.accent : '#d1d5db' }} />
        {step.n}
      </span>
      <h3 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight leading-[1.15]">{step.title}</h3>
      <p className="mt-3 text-gray-500 text-base md:text-lg font-light leading-relaxed max-w-md">{step.desc}</p>
    </div>
  )
}

export default function ProductShowcase() {
  const [activeD, setActiveD] = useState(0) // desktop
  const [activeM, setActiveM] = useState(0) // mobile
  const dRefs = useRef([])
  const trackRef = useRef(null)

  // Desktop: which text block is centered
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveD(Number(e.target.dataset.idx)) }),
      { rootMargin: '-48% 0px -48% 0px', threshold: 0 }
    )
    dRefs.current.forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // Mobile: map scroll progress through the track directly to a step.
  // rAF-throttled and only re-renders when the step actually changes.
  useEffect(() => {
    let ticking = false
    let last = -1
    const compute = () => {
      ticking = false
      const el = trackRef.current
      if (!el || el.offsetHeight === 0) return // hidden on desktop
      const total = el.offsetHeight - window.innerHeight
      if (total <= 0) return
      const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), total)
      const idx = Math.min(STEPS.length - 1, Math.floor((scrolled / total) * STEPS.length))
      if (idx !== last) { last = idx; setActiveM(idx) }
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(compute) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    compute()
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])

  return (
    <section className="relative px-6 max-w-5xl mx-auto">
      <div className="text-center py-12 md:py-16">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">The app</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">See it work.</h2>
      </div>

      {/* ── Desktop: phone sticky right, steps scroll left ── */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-12 md:items-start">
        <div className="flex flex-col">
          {STEPS.map((s, idx) => (
            <div key={idx} ref={(el) => (dRefs.current[idx] = el)} data-idx={idx} className="min-h-screen flex flex-col justify-center">
              <StepText step={s} active={activeD === idx} />
            </div>
          ))}
        </div>
        <div className="sticky top-0 h-screen flex items-center justify-center">
          <PhoneMockup step={activeD} />
        </div>
      </div>

      {/* ── Mobile: one pinned phone, screen + caption change as you scroll ── */}
      <div ref={trackRef} className="md:hidden relative" style={{ height: `${STEPS.length * 58}vh` }}>
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center gap-6">
          {/* Phone (scaled to fit; wrapper box matches scaled size so layout is clean) */}
          <div style={{ width: PHONE_W * M_SCALE, height: PHONE_H * M_SCALE }}>
            <div style={{ transform: `scale(${M_SCALE})`, transformOrigin: 'top left' }}>
              <PhoneMockup step={activeM} />
            </div>
          </div>
          {/* Caption */}
          <div className="relative w-full max-w-xs h-32 px-4 text-center">
            {STEPS.map((s, idx) => (
              <div key={idx} className="absolute inset-0 flex flex-col items-center transition-opacity duration-500" style={{ opacity: activeM === idx ? 1 : 0 }}>
                <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest mb-2" style={{ color: s.accent }}>
                  <span className="w-5 h-px" style={{ background: s.accent }} /> {s.n}
                </span>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">{s.title}</h3>
                <p className="text-sm text-gray-500 font-light leading-snug mt-1.5">{s.desc}</p>
              </div>
            ))}
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {STEPS.map((s, idx) => (
              <span key={idx} className="h-1.5 rounded-full transition-all duration-300" style={{ width: activeM === idx ? 18 : 6, background: activeM === idx ? s.accent : '#d1d5db' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Closing CTA */}
      <div className="flex justify-center pt-8 pb-4">
        <Link
          to="/app"
          className="group/cta inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#111] text-white font-semibold rounded-full raised-dark hover:bg-black hover:-translate-y-0.5 transition-all duration-200 ease-spring active:scale-[0.97] active:duration-75 text-sm"
        >
          <CameraIcon size={17} className="transition-transform duration-300 ease-spring group-hover/cta:rotate-[-8deg] group-hover/cta:scale-110" />
          Try it now
        </Link>
      </div>
    </section>
  )
}
