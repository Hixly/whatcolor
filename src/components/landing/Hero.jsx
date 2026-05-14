import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CameraIcon, UploadIcon } from '../ui/Icons'
import ColorCyclePill from './ColorCyclePill'

const LINE1_CHARS = 'Identify any '.split('')
const LINE2_CHARS = 'around you — instantly.'.split('')
const COLOR_OFFSET = LINE1_CHARS.length
const LINE2_OFFSET = COLOR_OFFSET + 'color'.length + 1

function WaveChar({ char, delay }) {
  return (
    <span className="inline-block animate-wave" style={{ animationDelay: `${delay}ms` }}>
      {char === ' ' ? ' ' : char}
    </span>
  )
}

export default function Hero() {
  const headlineRef = useRef(null)
  const [waveKey, setWaveKey] = useState(0)

  useEffect(() => {
    const el = headlineRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setWaveKey(k => k + 1) },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 gap-10 overflow-hidden">

      {/* Logo with spinning rainbow ring */}
      <div className="relative animate-scale-in flex items-center justify-center">
        <div
          className="absolute rounded-full animate-spin-slow"
          style={{
            width: 220,
            height: 220,
            background: 'conic-gradient(from 0deg, #FF3B30, #FF9500, #FFD60A, #30D158, #0A84FF, #BF5AF2, #FF3B30)',
            WebkitMask: 'radial-gradient(circle, transparent 71%, black 71%)',
            mask: 'radial-gradient(circle, transparent 71%, black 71%)',
            opacity: 0.35,
          }}
        />
        <img
          src="/logo-lockup-transparent.png"
          alt="WhatColor — See More. Know More."
          className="relative w-72 md:w-96 h-auto select-none"
          draggable={false}
        />
      </div>

      {/* Headline with scroll-triggered wave animation */}
      <div ref={headlineRef} className="max-w-2xl animate-fade-up delay-200">
        <h1
          key={waveKey}
          className="text-4xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-5"
        >
          {LINE1_CHARS.map((char, i) => (
            <WaveChar key={i} char={char} delay={i * 35} />
          ))}
          <span
            className="shimmer-text animate-shimmer inline-block animate-wave"
            style={{ animationDelay: `${COLOR_OFFSET * 35}ms` }}
          >
            color
          </span>
          <br className="hidden md:block" />
          {' '}
          <span className="font-light" style={{ color: '#9ca3af' }}>
            {LINE2_CHARS.map((char, i) => (
              <WaveChar key={i} char={char} delay={(LINE2_OFFSET + i) * 35} />
            ))}
          </span>
        </h1>
        <p className="text-gray-500 text-lg md:text-xl leading-relaxed font-light max-w-lg mx-auto">
          Built for people with color vision deficiency. Your daily companion for seeing the world more clearly.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-up delay-300">
        <Link
          to="/app"
          className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#111] text-white font-semibold rounded-full hover:bg-[#333] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] text-base"
        >
          <CameraIcon size={18} />
          Start Detecting Colors
        </Link>
        <Link
          to="/app?mode=upload"
          className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-gray-800 font-semibold rounded-full border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] text-base"
        >
          <UploadIcon size={18} />
          Upload an Image
        </Link>
      </div>

      {/* Live color cycle pill */}
      <div className="animate-fade-in delay-400">
        <ColorCyclePill />
      </div>

      <p className="text-sm text-gray-400 animate-fade-in delay-600 font-light">
        100% private · All processing on-device · Free forever
      </p>
    </section>
  )
}
