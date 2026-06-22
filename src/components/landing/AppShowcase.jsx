import { Link } from 'react-router-dom'
import { useInView } from '../../hooks/useInView'
import { CameraIcon, LockIcon } from '../ui/Icons'
import PhoneMockup from './PhoneMockup'

const BADGES = [
  { Icon: LockIcon, label: 'On-device' },
  { Icon: LockIcon, label: 'No account' },
  { Icon: LockIcon, label: 'Free forever' },
]

export default function AppShowcase() {
  const [ref, inView] = useInView()

  return (
    <section ref={ref} className="px-6 py-20 md:py-28 max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 md:gap-8 items-center">
        <div
          className={`order-2 md:order-1 text-center md:text-left transition-all duration-700 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">The app</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-[1.15]">
            Point your camera.
            <br />
            Know the color.
          </h2>
          <p className="mt-4 text-gray-500 text-base md:text-lg font-light leading-relaxed max-w-md mx-auto md:mx-0">
            Aim at anything and WhatColor names it in real time — with the exact hex, RGB, and a heads-up when a shade
            falls in your confusion zone.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start">
            {BADGES.map(({ Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur border border-gray-200/80 text-gray-600 text-xs font-medium"
              >
                <Icon size={13} className="text-gray-400" />
                {label}
              </span>
            ))}
          </div>
          <Link
            to="/app"
            className="group/cta mt-7 inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#111] text-white font-semibold rounded-full hover:bg-black hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.97] text-sm"
          >
            <CameraIcon
              size={17}
              className="transition-transform duration-300 group-hover/cta:rotate-[-8deg] group-hover/cta:scale-110"
            />
            Try it now
          </Link>
        </div>

        <div
          className={`order-1 md:order-2 transition-all duration-700 delay-150 ${
            inView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          <div className="animate-float">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
