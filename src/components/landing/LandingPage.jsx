import { Link } from 'react-router-dom'
import Hero from './Hero'
import ProductShowcase from './ProductShowcase'
import FounderNote from './FounderNote'
import HowItWorks from './HowItWorks'
import Features from './Features'
import FinalCTA from './FinalCTA'
import LandingNav from './LandingNav'
import InstallPrompt from './InstallPrompt'
import { SOCIALS } from '../../socials'

// Soft, vibrant color washes that slowly drift behind the page. Blur and opacity
// are STATIC (only the transform animates), so they always render as a soft glow
// — never hard circles.
const ORBS = [
  { color: '#FF3B30', left: '-12%', top: '12%',  size: 460, opacity: 0.55, dur: '9s',  delay: '0s'   },
  { color: '#0A84FF', left: '62%',  top: '6%',   size: 440, opacity: 0.5,  dur: '11s', delay: '0.8s' },
  { color: '#30D158', left: '-8%',  top: '46%',  size: 420, opacity: 0.5,  dur: '8s',  delay: '0.4s' },
  { color: '#FFD60A', left: '70%',  top: '42%',  size: 380, opacity: 0.55, dur: '10s', delay: '1.4s' },
  { color: '#BF5AF2', left: '34%',  top: '66%',  size: 360, opacity: 0.5,  dur: '9.5s', delay: '1.1s' },
  { color: '#FF9500', left: '24%',  top: '20%',  size: 320, opacity: 0.5,  dur: '12s', delay: '0.6s' },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <LandingNav />
      <InstallPrompt />

      {/* Animated color-wash background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {ORBS.map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-orb"
            style={{
              backgroundColor: orb.color,
              left: orb.left,
              top: orb.top,
              width: orb.size,
              height: orb.size,
              filter: 'blur(72px)',
              opacity: orb.opacity,
              animationDuration: orb.dur,
              animationDelay: orb.delay,
              willChange: 'transform',
            }}
          />
        ))}
        {/* Keep the very top white so the browser/status bar doesn't tint to an orb color */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-white via-white/80 to-transparent" />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <Hero />

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-8" />

        <ProductShowcase />

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-8" />

        <FounderNote />

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-8" />

        <HowItWorks />

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-8" />

        <Features />

        <FinalCTA />

        <footer className="border-t border-gray-100 px-6 py-10 bg-white/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <img src="/logo-symbol-transparent.png" alt="" className="h-7 w-7 object-contain" />
              <span className="text-sm font-semibold text-gray-900">WhatColor</span>
              <span className="text-sm text-gray-400 font-light">— See More. Know More.</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Social */}
              <div className="flex items-center gap-1.5">
                {SOCIALS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-black/[0.05] transition-all duration-200 ease-spring active:scale-90"
                  >
                    <Icon size={17} />
                  </a>
                ))}
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex gap-5 text-sm text-gray-400 font-medium">
                <Link to="/settings" className="hover:text-gray-900 transition-colors">Settings</Link>
                <Link to="/app" className="hover:text-gray-900 transition-colors">Open App</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
