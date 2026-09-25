import { useInView } from '../../hooks/useInView'
import { UploadIcon, CompareIcon, EyeIcon, LockIcon, HistoryIcon, DownloadIcon } from '../ui/Icons'

const CVD_SWATCHES = ['#D8552F', '#9A7B2E', '#8A6F3A', '#6E6E6E'] // a color seen 4 ways
const PALETTE = ['#FF3B30', '#FF9500', '#FFD60A', '#30D158', '#0A84FF', '#BF5AF2']

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

export default function Features() {
  const [ref, inView] = useInView()
  return (
    <section id="features" ref={ref} className="px-6 py-24 max-w-5xl mx-auto">
      <div className={`text-center mb-14 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Features</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Everything you need to see clearly.</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:auto-rows-[170px]">
        {/* Hero tile — real-time detection (dark, with a mini camera scene) */}
        <Tile inView={inView} delay={0} className="col-span-2 md:row-span-2 border border-white/10 overflow-hidden relative flex flex-col justify-end p-6 min-h-[300px] md:min-h-0">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 50% 18%, #f0a35f 0%, #d8552f 38%, #4a1f12 82%, #1a0c07 100%)' }} />
          <div className="absolute inset-x-0 top-0 h-1/2 flex items-center justify-center">
            <img
              src="/logo-symbol-transparent.png"
              srcSet="/logo-symbol-transparent.png 1x, /logo-symbol-transparent@2x.png 2x"
              alt=""
              className="h-14 w-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
              draggable={false}
            />
          </div>
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-white text-[10px] font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Live
            </span>
            <h3 className="text-white text-xl font-bold">Real-time detection</h3>
            <p className="text-white/70 text-sm font-light leading-relaxed mt-1">Aim your camera and read any color instantly — no tapping, no waiting.</p>
          </div>
        </Tile>

        {/* Upload */}
        <Tile inView={inView} delay={60} className="col-span-1 glass-light p-5 flex flex-col justify-between group">
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <UploadIcon size={17} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Upload images</h3>
            <p className="text-xs text-gray-500 font-light mt-0.5">Tap any photo to ID a color.</p>
          </div>
        </Tile>

        {/* Compare */}
        <Tile inView={inView} delay={120} className="col-span-1 glass-light p-5 flex flex-col justify-between group">
          <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <CompareIcon size={17} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Compare</h3>
            <p className="text-xs text-gray-500 font-light mt-0.5">Two colors, WCAG contrast.</p>
          </div>
        </Tile>

        {/* Colorblind awareness (wide, with CVD swatches) */}
        <Tile inView={inView} delay={180} className="col-span-2 glass-light p-5 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <EyeIcon size={17} />
            </div>
            <div className="flex gap-1.5">
              {CVD_SWATCHES.map((c, i) => (
                <span key={i} className="w-6 h-6 rounded-md border border-black/5" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Built for color vision deficiency</h3>
            <p className="text-xs text-gray-500 font-light mt-0.5">Confusion-zone warnings + see how others perceive any color.</p>
          </div>
        </Tile>

        {/* Privacy (wide) */}
        <Tile inView={inView} delay={240} className="col-span-2 bg-[#0e0e0e] border border-white/10 p-5 flex items-center gap-4 group">
          <div className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
            <LockIcon size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">100% on your device</h3>
            <p className="text-xs text-white/50 font-light mt-0.5">No images, frames, or data ever leave your phone. Works offline.</p>
          </div>
        </Tile>

        {/* History + export (wide, with palette dots) */}
        <Tile inView={inView} delay={300} className="col-span-2 glass-light p-5 flex flex-col justify-between group">
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
            <h3 className="text-sm font-bold text-gray-900">Save & export your palette</h3>
            <p className="text-xs text-gray-500 font-light mt-0.5">Label, keep, and download the colors you find.</p>
          </div>
        </Tile>
      </div>
    </section>
  )
}
