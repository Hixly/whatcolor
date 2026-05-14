import { Link } from 'react-router-dom'
import { CameraIcon, UploadIcon } from '../ui/Icons'

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 gap-10 bg-white overflow-hidden">
      {/* Logo — mix-blend-mode removes white bg box against pure white page */}
      <div className="animate-scale-in">
        <img
          src="/logo-lockup-transparent.png"
          alt="WhatColor — See More. Know More."
          className="w-72 md:w-96 h-auto select-none"
          draggable={false}
        />
      </div>

      {/* Headline */}
      <div className="max-w-2xl animate-fade-up delay-200">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-5">
          Identify any color<br className="hidden md:block" />{' '}
          <span className="text-gray-400 font-light">around you — instantly.</span>
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

      <p className="text-sm text-gray-400 animate-fade-in delay-500 font-light">
        100% private · All processing on-device · Free forever
      </p>
    </section>
  )
}
