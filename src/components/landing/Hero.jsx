import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CameraIcon, UploadIcon } from '../ui/Icons'
import ColorCyclePill from './ColorCyclePill'
import TrustPills from './TrustPills'

const STEP = 35

/** Render a word as non-breaking, with each letter waving in sequence. */
function WaveWord({ word, startIndex, className = '' }) {
  return (
    <span className={`inline-flex whitespace-nowrap ${className}`}>
      {word.split('').map((char, i) => (
        <span
          key={i}
          className="inline-block animate-wave"
          style={{ animationDelay: `${(startIndex + i) * STEP}ms` }}
        >
          {char}
        </span>
      ))}
    </span>
  )
}

// [word, isColor] — color word gets the shimmer treatment.
const LINE1 = [['Identify', false], ['any', false], ['color', true]]
const LINE2 = [['around', false], ['you', false], ['—', false], ['instantly.', false]]

// Continuous letter index so the wave flows across the whole headline.
function withDelays(words, offset) {
  let idx = offset
  return words.map(([word, isColor]) => {
    const start = idx
    idx += word.length + 1 // +1 keeps a beat for the space between words
    return { word, isColor, start }
  })
}

const LINE1_WORDS = withDelays(LINE1, 0)
const LINE2_WORDS = withDelays(LINE2, LINE1_WORDS.at(-1).start + 'color'.length + 1)

export default function Hero() {
  const headlineRef = useRef(null)
  const [waveKey, setWaveKey] = useState(0)

  // Play wave on first paint — hero is always above the fold on load.
  useEffect(() => {
    setWaveKey(1)
  }, [])

  useEffect(() => {
    const el = headlineRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setWaveKey(k => k + 1) },
      { threshold: 0.35 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 gap-10 overflow-hidden">

      <div className="animate-fade-in flex items-center justify-center">
        <img
          src="/logo-lockup-transparent.png"
          alt="WhatColor — See More. Know More."
          className="w-72 sm:w-80 md:w-96 h-auto select-none"
          width={384}
          height={297}
          decoding="sync"
          fetchPriority="high"
          draggable={false}
        />
      </div>

      <div ref={headlineRef} className="w-full max-w-3xl animate-fade-up delay-200">
        <h1
          key={waveKey}
          className="text-[2rem] leading-[1.15] sm:text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-5 mx-auto"
        >
          <span className="flex flex-wrap justify-center gap-x-[0.28em] gap-y-1">
            {LINE1_WORDS.map(({ word, isColor, start }) => (
              <WaveWord
                key={word}
                word={word}
                startIndex={start}
                className={isColor ? 'shimmer-text animate-shimmer' : ''}
              />
            ))}
          </span>
          <span className="mt-1 flex flex-wrap justify-center gap-x-[0.28em] gap-y-1 font-light text-gray-400">
            {LINE2_WORDS.map(({ word, start }) => (
              <WaveWord key={word} word={word} startIndex={start} />
            ))}
          </span>
        </h1>
        <p className="text-gray-500 text-lg md:text-xl leading-relaxed font-light max-w-lg mx-auto">
          Built for people with color vision deficiency. Your daily companion for seeing the world more clearly.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 animate-fade-up delay-300 w-full max-w-md sm:max-w-none sm:w-auto justify-center">
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

      <div className="animate-fade-in delay-400 flex flex-col items-center gap-5 w-full">
        <ColorCyclePill />
        <TrustPills className="delay-500 max-w-lg px-2" />
      </div>
    </section>
  )
}
