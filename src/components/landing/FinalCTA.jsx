import { Link } from 'react-router-dom'
import { useInView } from '../../hooks/useInView'
import { CameraIcon, UploadIcon } from '../ui/Icons'

export default function FinalCTA() {
  const [ref, inView] = useInView()
  return (
    <section ref={ref} className="px-6 py-16 md:py-24">
      <div
        className={`relative max-w-4xl mx-auto rounded-[2rem] bg-[#0b0b0c] border border-white/10 px-7 py-16 md:py-20 text-center overflow-hidden transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ boxShadow: '0 40px 90px -40px rgba(0,0,0,0.5)' }}
      >
        {/* Rainbow glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[120%] h-56 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #FF3B30, #FF9500, #FFD60A, #30D158, #0A84FF, #BF5AF2)', filter: 'blur(90px)', opacity: 0.35 }}
        />

        <div className="relative">
          <div className="flex justify-center mb-6">
            <img src="/icon-192.png" alt="" className="w-14 h-14 rounded-2xl border border-white/10" draggable={false} />
          </div>
          <h2 className="text-white text-3xl md:text-5xl font-bold tracking-tight leading-[1.1]">
            See color clearly.
          </h2>
          <p className="text-white/60 text-base md:text-lg font-light mt-4 max-w-md mx-auto leading-relaxed">
            Free, private, and on your device. No account, no ads. Point your camera and know the color in
            a second.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/app"
              className="group/cta inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-[#111] font-semibold rounded-full raised-light hover:-translate-y-0.5 transition-all duration-200 ease-spring active:scale-[0.97] active:duration-75 text-base"
            >
              <CameraIcon size={18} className="transition-transform duration-300 ease-spring group-hover/cta:rotate-[-8deg] group-hover/cta:scale-110" />
              Start Detecting Colors
            </Link>
            <Link
              to="/app?mode=upload"
              className="group/up inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white/[0.08] text-white font-semibold rounded-full border border-white/15 hover:bg-white/[0.14] hover:-translate-y-0.5 transition-all duration-200 ease-spring active:scale-[0.97] text-base"
            >
              <UploadIcon size={18} className="transition-transform duration-300 ease-spring group-hover/up:-translate-y-0.5" />
              Use a Photo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
