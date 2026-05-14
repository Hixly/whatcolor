import { Link } from 'react-router-dom'
import CrosshairReticle from '../app/CrosshairReticle'

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 gap-8">
      {/* Logo */}
      <div className="flex flex-col items-center gap-5">
        <CrosshairReticle size={120} lineColor="#111111" />
        <div>
          <div className="text-5xl font-bold tracking-tight text-gray-900">
            <span className="font-normal">What</span><span className="text-brand-red">Color</span>
          </div>
          <p className="mt-2 text-xs text-gray-400 tracking-[0.25em] uppercase font-semibold">
            See More. Know More.
          </p>
        </div>
      </div>

      {/* Headline */}
      <div className="max-w-xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          Identify any color around you — instantly.
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          Built for people with color vision deficiency. Not a designer tool — a daily companion for seeing the world more clearly.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link
          to="/app"
          className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors text-base"
        >
          📷 Start Detecting Colors
        </Link>
        <Link
          to="/app?mode=upload"
          className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-colors text-base"
        >
          🖼️ Upload an Image
        </Link>
      </div>

      <p className="text-xs text-gray-400">100% private — all processing happens on your device. Free forever.</p>
    </section>
  )
}
