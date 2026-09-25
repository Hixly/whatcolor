import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CameraIcon, UploadIcon } from '../ui/Icons'
import ColorCyclePill from './ColorCyclePill'

const LINE1_WORDS = ['Identify', 'any']
const COLOR_WORD  = 'color'
const LINE2_WORDS = ['in', 'words', 'you', 'actually', 'use.']

function wordOffsets(words, start = 0) {
  const offsets = []
  let pos = start
  for (const w of words) {
    offsets.push(pos)
    pos += w.length + 1
  }
  return offsets
}

const L1_OFFSETS   = wordOffsets(LINE1_WORDS, 0)
const COLOR_OFFSET = L1_OFFSETS.at(-1) + LINE1_WORDS.at(-1).length + 1
const L2_OFFSETS   = wordOffsets(LINE2_WORDS, COLOR_OFFSET + COLOR_WORD.length + 1)

// Each letter independently bounces. Outer span is stable (holds ref + event listener).
// Inner span is re-keyed on each trigger so CSS animation restarts cleanly.
function WaveLetter({ ch, delay = 0 }) {
  const [count, setCount] = useState(0)
  const outerRef = useRef(null)

  const trigger = useCallback(() => setCount(c => c + 1), [])

  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    el.addEventListener('wc-wave', trigger)
    return () => el.removeEventListener('wc-wave', trigger)
  }, [trigger])

  return (
    <span ref={outerRef} data-wc-letter="" className="inline-block" onMouseEnter={trigger}>
      <span
        key={count}
        className="inline-block animate-wave"
        style={{ animationDelay: count === 0 ? `${delay}ms` : '0ms' }}
      >
        {ch}
      </span>
    </span>
  )
}

export default function Hero() {
  const headlineRef = useRef(null)
  const [waveKey, setWaveKey] = useState(0)

  // Scroll-in: re-key h1 to restart all letter delays as a wave
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

  // Touch swipe: find the letter under the finger and fire a custom event on it
  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0]
    let el = document.elementFromPoint(touch.clientX, touch.clientY)
    while (el && el !== e.currentTarget && !el.hasAttribute('data-wc-letter')) {
      el = el.parentElement
    }
    if (el && el !== e.currentTarget) {
      el.dispatchEvent(new CustomEvent('wc-wave'))
    }
  }, [])

  return (
    <section className="flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 gap-10 overflow-hidden">

      {/* Logo with spinning rainbow ring */}
      <div className="relative animate-scale-in flex items-center justify-center">
        <div
          className="absolute rounded-full animate-spin-slow"
          style={{
            width: 430,
            height: 430,
            background: 'conic-gradient(from 0deg, #FF3B30, #FF9500, #FFD60A, #30D158, #0A84FF, #BF5AF2, #FF3B30)',
            WebkitMask: 'radial-gradient(circle, transparent 71%, black 71%)',
            mask: 'radial-gradient(circle, transparent 71%, black 71%)',
            opacity: 0.35,
          }}
        />
        <img
          src="/logo-lockup-transparent.png"
          srcSet="/logo-lockup-transparent.png 1x, /logo-lockup-transparent@2x.png 2x"
          alt="WhatColor. See more. Know more."
          className="relative w-[46rem] md:w-[42rem] h-auto select-none"
          draggable={false}
        />
      </div>

      {/* Headline: scroll-in wave via h1 key, per-letter hover/swipe via WaveLetter */}
      <div ref={headlineRef} className="max-w-3xl animate-fade-up delay-200">
        <a
          href="#engine"
          onClick={(e) => { e.preventDefault(); document.getElementById('engine')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
          className="group/new inline-flex items-center gap-2 mb-6 pl-1.5 pr-3.5 py-1.5 rounded-full glass-light text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-all duration-200 ease-spring hover:-translate-y-0.5"
        >
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white" style={{ background: 'linear-gradient(90deg, #FF3B30, #FF9500, #30D158, #0A84FF, #BF5AF2)' }}>NEW</span>
          <span className="sm:hidden">Rebuilt color engine</span>
          <span className="hidden sm:inline">A rebuilt engine that names colors like a person</span>
          <span className="text-gray-400 transition-transform duration-200 group-hover/new:translate-x-0.5">›</span>
        </a>
        <h1
          key={waveKey}
          className="text-4xl md:text-6xl font-bold text-gray-900 leading-[1.2] tracking-tight mb-5 cursor-default select-none"
          onTouchMove={handleTouchMove}
        >
          {LINE1_WORDS.map((word, wi) => (
            <span key={wi}>
              <span className="inline-block whitespace-nowrap">
                {word.split('').map((ch, ci) => (
                  <WaveLetter key={ci} ch={ch} delay={(L1_OFFSETS[wi] + ci) * 32} />
                ))}
              </span>
              {' '}
            </span>
          ))}

          {/* "color" — outer bounces as word unit, inner carries shimmer; can't split per-letter because background-clip:text breaks with nested inline-block children */}
          <span className="inline-block whitespace-nowrap animate-wave" style={{ animationDelay: `${COLOR_OFFSET * 32}ms` }}>
            <span className="shimmer-text animate-shimmer">{COLOR_WORD}</span>
          </span>

          {/* Line two always starts on its own line, balanced so no word is orphaned */}
          <span className="block font-light [text-wrap:balance]" style={{ color: '#9ca3af' }}>
            {LINE2_WORDS.map((word, wi) => (
              <span key={wi}>
                <span className="inline-block whitespace-nowrap">
                  {word.split('').map((ch, ci) => (
                    <WaveLetter key={ci} ch={ch} delay={(L2_OFFSETS[wi] + ci) * 32} />
                  ))}
                </span>
                {wi < LINE2_WORDS.length - 1 ? ' ' : ''}
              </span>
            ))}
          </span>
        </h1>

        <p className="text-gray-500 text-lg md:text-xl leading-relaxed font-light max-w-lg mx-auto">
          Point your camera and WhatColor names it the way a friend would: navy, olive, dusty rose.
          Built by a colorblind developer, for anyone who sees color a little differently.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-up delay-300">
        <Link
          to="/app"
          className="group/cta inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#111] text-white font-semibold rounded-full raised-dark hover:bg-black hover:-translate-y-0.5 transition-all duration-200 ease-spring active:scale-[0.97] active:duration-75 text-base select-none"
        >
          <CameraIcon size={18} className="transition-transform duration-300 ease-spring group-hover/cta:rotate-[-8deg] group-hover/cta:scale-110" />
          Start Detecting Colors
        </Link>
        <Link
          to="/app?mode=upload"
          className="group/cta inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-gray-800 font-semibold rounded-full border border-gray-200 raised-light hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200 ease-spring active:scale-[0.97] active:duration-75 text-base select-none"
        >
          <UploadIcon size={18} className="transition-transform duration-300 ease-spring group-hover/cta:-translate-y-0.5" />
          Use a Photo
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
