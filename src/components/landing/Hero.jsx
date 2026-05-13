import { Link } from 'react-router-dom'
import CrosshairReticle from '../app/CrosshairReticle'

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 gap-8">
      {/* Logo */}
      <div className="flex flex-col items-center gap-4">
        <CrosshairReticle size={100} />
        <div className="text-4xl font-bold tracking-tight text-white">
          <span className="font-normal">What</span>Color
        </div>
        <p className="text-gray-500 text-sm tracking-widest uppercase font-medium">See More. Know More.</p>
      </div>

      {/* Headline */}
      <div className="max-w-xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
          Identify any color around you — instantly.
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Built for people with color vision deficiency. Not a designer tool — a daily companion for seeing the world more clearly.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link
          to="/app"
          className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-colors text-base"
        >
          📷 Start Detecting Colors
        </Link>
        <Link
          to="/app?mode=upload"
          className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-dark-surface border border-dark-border text-white font-semibold rounded-2xl hover:bg-[#1e1e1e] transition-colors text-base"
        >
          🖼️ Upload an Image
        </Link>
      </div>

      <p className="text-xs text-gray-600">100% private — all processing happens on your device. Free forever.</p>
    </section>
  )
}
