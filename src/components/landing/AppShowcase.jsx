import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useInView } from '../../hooks/useInView'
import { useSectionScrollProgress } from '../../hooks/useSectionScrollProgress'
import { CameraIcon } from '../ui/Icons'
import PhoneMockup from './PhoneMockup'
import TrustPills from './TrustPills'

const SCROLL_BEATS = [
  {
    eyebrow: 'The app',
    title: ['Point your camera.', 'Know the color.'],
    body: 'Aim at anything and WhatColor names it in real time — with the exact hex, RGB, and a heads-up when a shade falls in your confusion zone.',
  },
  {
    eyebrow: 'Real-time',
    title: ['No tap.', 'No wait.'],
    body: 'The crosshair samples continuously as you move. The name settles when you hold still — the same rhythm you feel in the real app.',
  },
  {
    eyebrow: 'Private by design',
    title: ['Your camera', 'stays yours.'],
    body: 'Every frame is processed on your device. Nothing is uploaded, stored, or sold. Works offline once loaded.',
  },
]

export default function AppShowcase() {
  const sectionRef = useRef(null)
  const [inViewRef, inView] = useInView({ threshold: 0.08 })
  const scrollProgress = useSectionScrollProgress(sectionRef)

  const setRefs = (node) => {
    sectionRef.current = node
    inViewRef.current = node
  }

  const phoneParallax = (scrollProgress - 0.5) * 28
  const phoneScale = 1 + scrollProgress * 0.03

  return (
    <section ref={setRefs} className="relative px-6 py-20 md:py-28 max-w-5xl mx-auto">
      <div className="lg:hidden mb-10">
        <div
          className={`flex justify-center transition-all duration-700 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <PhoneMockup />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 xl:gap-16">
        <div className="flex flex-col">
          {SCROLL_BEATS.map((beat, i) => (
            <div
              key={beat.eyebrow}
              className={`flex flex-col justify-center text-center md:text-left py-10 lg:py-14 lg:min-h-[68vh] first:pt-0 last:pb-0 transition-all duration-700 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: inView ? `${i * 100}ms` : '0ms' }}
            >
              <p className="section-eyebrow mb-3">{beat.eyebrow}</p>
              <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-gray-900 tracking-tight leading-[1.1] mb-4">
                {beat.title[0]}
                <br />
                <span className="font-light text-gray-400">{beat.title[1]}</span>
              </h2>
              <p className="text-gray-500 text-base md:text-lg font-light leading-relaxed max-w-md mx-auto md:mx-0">
                {beat.body}
              </p>

              {i === SCROLL_BEATS.length - 1 && (
                <div className="mt-7 space-y-5 flex flex-col items-center md:items-start">
                  <TrustPills className="justify-center md:justify-start" size="compact" />
                  <Link
                    to="/app"
                    className="group/cta inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#111] text-white font-semibold rounded-full hover:bg-black hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.97] text-sm"
                  >
                    <CameraIcon
                      size={17}
                      className="transition-transform duration-300 group-hover/cta:rotate-[-8deg] group-hover/cta:scale-110"
                    />
                    Try it now
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hidden lg:block relative">
          <div
            className={`sticky top-[18vh] transition-opacity duration-700 ${
              inView ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: `translateY(${phoneParallax}px) scale(${phoneScale})`,
              transition: 'transform 0.15s ease-out, opacity 0.7s ease',
            }}
          >
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
