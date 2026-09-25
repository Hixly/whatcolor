import { useState, useEffect } from 'react'
import { BookmarkIcon, HomeIcon, SettingsIcon, ArrowLeftIcon, WarningIcon, DownloadIcon } from '../ui/Icons'
import { simulateCvd, CVD_PREVIEW_TYPES } from '../../utils/cvdSimulate'

const STOPS = [
  { x: 30, y: 28, name: 'Terracotta',   hex: '#D8552F', rgb: '216·85·47'  },
  { x: 70, y: 25, name: 'Ocean Blue',   hex: '#0A84FF', rgb: '10·132·255' },
  { x: 71, y: 52, name: 'Sage Green',   hex: '#30D158', rgb: '48·209·88'  },
  { x: 31, y: 54, name: 'Golden Hour',  hex: '#FFD60A', rgb: '255·214·10' },
  { x: 50, y: 40, name: 'Royal Purple', hex: '#BF5AF2', rgb: '191·90·242' },
]

const HISTORY = [
  { name: 'Terracotta',   hex: '#D8552F' },
  { name: 'Ocean Blue',   hex: '#0A84FF' },
  { name: 'Sage Green',   hex: '#30D158' },
  { name: 'Golden Hour',  hex: '#FFD60A' },
  { name: 'Royal Purple', hex: '#BF5AF2' },
]

function TopBar() {
  return (
    <>
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/45 to-transparent z-10" />
      <div className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/70">
        <HomeIcon size={14} />
      </div>
      <div className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/70">
        <SettingsIcon size={14} />
      </div>
    </>
  )
}

function Reticle({ x, y, animated }) {
  return (
    <div
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%`, transition: animated ? 'left 1.1s cubic-bezier(0.65,0,0.35,1), top 1.1s cubic-bezier(0.65,0,0.35,1)' : 'none' }}
    >
      <img
        src="/logo-symbol-transparent.png"
        srcSet="/logo-symbol-transparent.png 1x, /logo-symbol-transparent@2x.png 2x"
        alt=""
        className="h-[46px] w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
        draggable={false}
      />
    </div>
  )
}

// Screen 0 — live detection, target glides between colored regions
function CameraScreen() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % STOPS.length), 2200)
    return () => clearInterval(t)
  }, [])
  const stop = STOPS[i]
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 100% at 50% 30%, #2b2723 0%, #141110 100%)' }} />
      {STOPS.map((s, idx) => (
        <div key={idx} className="absolute rounded-full -translate-x-1/2 -translate-y-1/2" style={{ left: `${s.x}%`, top: `${s.y}%`, width: '26%', aspectRatio: '1', background: s.hex, filter: 'blur(9px)', opacity: 0.92 }} />
      ))}
      <TopBar />
      <Reticle x={stop.x} y={stop.y} animated />
      <div className="absolute inset-x-2 z-20" style={{ bottom: 64 }}>
        <div className="rounded-2xl border border-white/10 backdrop-blur-xl px-3 py-2.5" style={{ background: `linear-gradient(180deg, ${stop.hex}2e 0%, rgba(15,15,15,0.92) 60%)`, boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.12)', transition: 'background 0.7s ease' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] shrink-0" style={{ backgroundColor: stop.hex, boxShadow: `0 0 0 1px rgba(255,255,255,0.12), 0 3px 12px 0 ${stop.hex}8c`, transition: 'background-color 0.6s ease' }} />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-[13px] leading-tight">{stop.name}</p>
              <p className="font-mono text-[9px] text-white/60 leading-tight mt-0.5">{stop.hex} · {stop.rgb}</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/70"><BookmarkIcon size={12} /></div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-black/35 backdrop-blur-xl border border-white/10">
        <span className="w-7 h-7 rounded-full bg-white/5" />
        <span className="w-10 h-10 rounded-full bg-white border-2 border-white/60" />
        <span className="w-7 h-7 rounded-full bg-white/5" />
      </div>
    </>
  )
}

// Screen 1 — colorblind awareness: a color + how others see it + a warning
function CvdScreen() {
  const hex = '#E0392B'
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 100% at 50% 28%, #3a2723 0%, #141110 100%)' }} />
      <div className="absolute rounded-full -translate-x-1/2 -translate-y-1/2" style={{ left: '50%', top: '30%', width: '40%', aspectRatio: '1', background: hex, filter: 'blur(10px)', opacity: 0.95 }} />
      <TopBar />
      <Reticle x={50} y={30} animated={false} />
      <div className="absolute inset-x-2 z-20" style={{ bottom: 16 }}>
        <div className="rounded-2xl border border-white/10 backdrop-blur-xl px-3 py-3" style={{ background: `linear-gradient(180deg, ${hex}2e 0%, rgba(15,15,15,0.94) 55%)`, boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] shrink-0" style={{ backgroundColor: hex, boxShadow: `0 0 0 1px rgba(255,255,255,0.12), 0 3px 12px 0 ${hex}8c` }} />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-[13px] leading-tight">Cherry Red</p>
              <p className="font-mono text-[9px] text-white/60 leading-tight mt-0.5">{hex} · 224·57·43</p>
            </div>
          </div>
          {/* Warning */}
          <div className="mt-2.5 flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <WarningIcon size={11} className="text-yellow-300 shrink-0 mt-0.5" />
            <span className="text-yellow-200/90 text-[9px] font-light leading-snug">Often mistaken for green or brown.</span>
          </div>
          {/* How others see it */}
          <p className="text-white/35 text-[8px] font-bold uppercase tracking-widest mt-2.5 mb-1.5">How others may see it</p>
          <div className="grid grid-cols-4 gap-1.5">
            {CVD_PREVIEW_TYPES.map(({ type, label }) => (
              <div key={type} className="flex flex-col items-center gap-1">
                <div className="w-full h-6 rounded-md border border-white/10" style={{ backgroundColor: simulateCvd(hex, type) }} />
                <span className="text-white/40 text-[7px] font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// Screen 2 — saved palette / history
function HistoryScreen() {
  return (
    <>
      <div className="absolute inset-0 bg-[#0f0f0f]" />
      <div className="absolute top-0 inset-x-0 z-10 flex items-center gap-2.5 px-4 pt-9 pb-3 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60"><ArrowLeftIcon size={13} /></div>
        <p className="text-white font-bold text-[13px] flex-1">Color History</p>
        <span className="text-[9px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{HISTORY.length}</span>
      </div>
      <div className="absolute inset-x-0 z-10" style={{ top: 78, bottom: 56 }}>
        <div className="px-2.5 py-1.5">
          {HISTORY.map((h) => (
            <div key={h.name} className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
              <div className="w-8 h-8 rounded-lg border border-white/10 shrink-0" style={{ backgroundColor: h.hex }} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-[11px] leading-tight">{h.name}</p>
                <p className="font-mono text-[8px] text-white/35 leading-tight">{h.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-3 inset-x-3 z-20 flex gap-2">
        <span className="flex-1 flex items-center justify-center gap-1 py-2 rounded-full bg-white/[0.08] border border-white/10 text-white/70 text-[10px] font-semibold"><DownloadIcon size={11} /> PNG</span>
        <span className="flex-1 flex items-center justify-center gap-1 py-2 rounded-full bg-white/[0.08] border border-white/10 text-white/70 text-[10px] font-semibold"><DownloadIcon size={11} /> JSON</span>
      </div>
    </>
  )
}

export default function PhoneMockup({ step = 0, className = '' }) {
  const screens = [<CameraScreen key="c" />, <CvdScreen key="v" />, <HistoryScreen key="h" />]
  return (
    <div className={`relative mx-auto ${className}`} style={{ width: 268 }}>
      <div className="relative rounded-[46px] bg-[#0b0b0c] p-[10px] border border-white/10" style={{ boxShadow: '0 40px 80px -28px rgba(0,0,0,0.55), 0 8px 24px -12px rgba(0,0,0,0.4)' }}>
        <div className="relative rounded-[38px] overflow-hidden" style={{ aspectRatio: '9 / 19.3' }}>
          {screens.map((s, idx) => (
            <div key={idx} className="absolute inset-0 transition-opacity duration-500" style={{ opacity: step === idx ? 1 : 0, pointerEvents: step === idx ? 'auto' : 'none' }}>
              {s}
            </div>
          ))}
          {/* Dynamic island stays constant on top */}
          <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[78px] h-[22px] bg-black rounded-full z-30" />
        </div>
      </div>
    </div>
  )
}
