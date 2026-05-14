import { Link } from 'react-router-dom'
import Hero from './Hero'
import HowItWorks from './HowItWorks'
import Features from './Features'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-8" />

      <HowItWorks />

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-8" />

      <Features />

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-10 bg-white">
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
  )
}
