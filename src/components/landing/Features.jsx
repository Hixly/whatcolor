import { useInView } from '../../hooks/useInView'
import { UploadIcon, CompareIcon, EyeIcon, LockIcon, HistoryIcon, DownloadIcon, SunIcon, SpeakerIcon } from '../ui/Icons'
import { simulateRgb, CVD_SHORT } from '../../engine/cvd'
import { toHex } from '../../engine/colorMath'
import { WhatColorMark } from '../brand/Logo'

// One maroon, as four kinds of eyes see it (computed, not hand-picked).
const MAROON = { r: 110, g: 26, b: 42 }
const CVD_SWATCHES = [null, 'protanopia', 'deuteranopia', 'tritanopia'].map((t) => {
  const s = t ? simulateRgb(MAROON, t) : MAROON
  return { label: t ? CVD_SHORT[t] : 'Typical', hex: toHex(s.r, s.g, s.b) }
})
const PALETTE = ['#6E1A2A', '#C4673F', '#E1AD01', '#5B5B2E', '#3B5B84', '#C3A6E6']

function Tile({ children, className = '', inView, delay = 0 }) {
  return (
    <div
      className={`rounded-3xl transition-all duration-500 ease-soft hover:-translate-y-1 ${className} ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

function SmallTile({ Icon, tint, title, desc, inView, delay }) {
  return (
    <Tile inView={inView} delay={delay} className="col-span-1 glass-light p-5 flex flex-col justify-between gap-4 group min-h-[150px]">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${tint}`}>
        <Icon size={17} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 font-light mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </Tile>
  )
}

export default function Features() {
  const [ref, inView] = useInView()
  return (
    <section id="features" ref={ref} className="px-4 sm:px-6 py-20 md:py-24 max-w-5xl mx-auto scroll-mt-20">
      <div className={`text-center mb-14 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Features</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Everything you need to see clearly.</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:auto-rows-[170px]">
        {/* Real-time detection */}
        <Tile inView={inView} delay={0} className="col-span-2 md:row-span-2 border border-white/10 overflow-hidden relative flex flex-col justify-end p-6 min-h-[300px] md:min-h-0">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 50% 18%, #f0a35f 0%, #d8552f 38%, #4a1f12 82%, #1a0c07 100%)' }} />
          <div className="absolute inset-x-0 top-0 h-1/2 flex items-center justify-center">
            <WhatColorMark size={84} className="drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" />
          </div>
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-white text-[10px] font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Live
            </span>
            <h3 className="text-white text-xl font-bold">Real-time detection</h3>
            <p className="text-white/75 text-sm font-light leading-relaxed mt-1">
              Aim at anything and read it live. Hold steady and the name locks in, without flickering.
            </p>
          </div>
        </Tile>

        <SmallTile Icon={UploadIcon} tint="bg-orange-50 text-orange-500" title="Use a photo" desc="Tap or drag across any picture." inView={inView} delay={60} />
        <SmallTile Icon={CompareIcon} tint="bg-green-50 text-green-600" title="Compare two" desc="Would these look the same to you?" inView={inView} delay={120} />
        <SmallTile Icon={SunIcon} tint="bg-amber-50 text-amber-600" title="Set white" desc="Warm bulb? One tap corrects the light." inView={inView} delay={180} />
        <SmallTile Icon={SpeakerIcon} tint="bg-sky-50 text-sky-600" title="Read it aloud" desc="Hear the name and a plain description." inView={inView} delay={240} />

        {/* Color vision */}
        <Tile inView={inView} delay={300} className="col-span-2 glass-light p-5 flex flex-col justify-between gap-4 group">
          <div className="flex items-start justify-between gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
              <EyeIcon size={17} />
            </div>
            <div className="flex gap-1.5">
              {CVD_SWATCHES.map((c) => (
                <span key={c.label} className="flex flex-col items-center gap-1">
                  <span className="w-7 h-7 rounded-lg border border-black/5" style={{ backgroundColor: c.hex }} />
                  <span className="text-[9px] text-gray-400 font-medium">{c.label}</span>
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Built for color vision deficiency</h3>
            <p className="text-xs text-gray-500 font-light mt-0.5 leading-relaxed">
              Heads-ups come from simulating your own type of color vision, not a generic list.
            </p>
          </div>
        </Tile>

        {/* Privacy */}
        <Tile inView={inView} delay={360} className="col-span-2 bg-[#0e0e0e] border border-white/10 p-5 flex items-center gap-4 group">
          <div className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
            <LockIcon size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">100% on your device</h3>
            <p className="text-xs text-white/55 font-light mt-0.5 leading-relaxed">No images, frames, or data ever leave your phone. Works offline once it has loaded.</p>
          </div>
        </Tile>

        {/* History + export */}
        <Tile inView={inView} delay={420} className="col-span-2 glass-light p-5 flex flex-col justify-between gap-4 group">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <HistoryIcon size={17} />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400">
              <DownloadIcon size={12} /> PNG · JSON
            </span>
          </div>
          <div>
            <div className="flex gap-1.5 mb-2">
              {PALETTE.map((c) => <span key={c} className="w-5 h-5 rounded-full" style={{ backgroundColor: c }} />)}
            </div>
            <h3 className="text-sm font-bold text-gray-900">Save and export your palette</h3>
            <p className="text-xs text-gray-500 font-light mt-0.5">Label, keep, and download the colors you find.</p>
          </div>
        </Tile>

        {/* Install */}
        <Tile inView={inView} delay={480} className="col-span-2 glass-light p-5 flex items-center gap-4 group">
          <img src="/icon-192.png?v=3" alt="" className="w-12 h-12 rounded-2xl border border-black/5 shrink-0 transition-transform duration-300 group-hover:scale-105" draggable={false} />
          <div>
            <h3 className="text-sm font-bold text-gray-900">Install it like an app</h3>
            <p className="text-xs text-gray-500 font-light mt-0.5 leading-relaxed">Add WhatColor to your home screen. It opens instantly, even with no signal.</p>
          </div>
        </Tile>
      </div>
    </section>
  )
}
