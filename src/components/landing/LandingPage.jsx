import { Link } from 'react-router-dom'
import Hero from './Hero'
import HowItWorks from './HowItWorks'
import Features from './Features'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-light-bg">
      <Hero />
      <HowItWorks />
      <Features />

      {/* Footer */}
      <footer className="border-t border-light-border px-6 py-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo-symbol.png" alt="WhatColor logo" className="h-6 w-6 object-contain" />
            <span className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">WhatColor.io</span> — See More. Know More.
            </span>
          </div>
          <p className="text-xs text-gray-400">Built by a colorblind developer, for colorblind people.</p>
          <div className="flex gap-5 text-xs text-gray-400">
            <Link to="/settings" className="hover:text-gray-900 transition-colors">Settings</Link>
            <Link to="/app" className="hover:text-gray-900 transition-colors">Open App</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
