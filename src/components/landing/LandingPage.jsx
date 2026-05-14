import { Link } from 'react-router-dom'
import Hero from './Hero'
import HowItWorks from './HowItWorks'
import Features from './Features'

const ORBS = [
  { color: '#FF3B30', left: '-8%',  top: '2%',   size: 480, floatDur: '4s',  colorDur: '5s',  floatDelay: '0s',    colorDelay: '0s'   },
  { color: '#0A84FF', left: '68%',  top: '-2%',  size: 420, floatDur: '5s',  colorDur: '7s',  floatDelay: '0.5s',  colorDelay: '2s'   },
  { color: '#30D158', left: '-4%',  top: '45%',  size: 380, floatDur: '3.5s',colorDur: '6s',  floatDelay: '1s',    colorDelay: '1s'   },
  { color: '#FFD60A', left: '75%',  top: '40%',  size: 340, floatDur: '4.5s',colorDur: '8s',  floatDelay: '1.5s',  colorDelay: '3s'   },
  { color: '#BF5AF2', left: '35%',  top: '70%',  size: 300, floatDur: '3s',  colorDur: '5.5s',floatDelay: '2s',    colorDelay: '1.5s' },
  { color: '#FF9500', left: '20%',  top: '5%',   size: 280, floatDur: '5.5s',colorDur: '9s',  floatDelay: '0.8s',  colorDelay: '4s'   },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Fixed color orbs — persist across all landing sections */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {ORBS.map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              backgroundColor: orb.color,
              left: orb.left,
              top: orb.top,
              width: orb.size,
              height: orb.size,
              filter: 'blur(60px)',
              opacity: 0.12,
              animation: `floatOrb ${orb.floatDur} ease-in-out infinite ${orb.floatDelay}, orbColor ${orb.colorDur} ease-in-out infinite ${orb.colorDelay}`,
            }}
          />
        ))}
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <Hero />

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-8" />

        <HowItWorks />

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-8" />

        <Features />

        <footer className="border-t border-gray-100 px-6 py-10 bg-white/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <img src="/logo-symbol-transparent.png" alt="" className="h-7 w-7 object-contain" />
              <span className="text-sm font-semibold text-gray-900">WhatColor.io</span>
              <span className="text-sm text-gray-400 font-light">— See More. Know More.</span>
            </div>
            <p className="text-xs text-gray-400 font-light">Built by a colorblind developer, for colorblind people.</p>
            <div className="flex gap-6 text-sm text-gray-400 font-medium">
              <Link to="/settings" className="hover:text-gray-900 transition-colors">Settings</Link>
              <Link to="/app" className="hover:text-gray-900 transition-colors">Open App</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
