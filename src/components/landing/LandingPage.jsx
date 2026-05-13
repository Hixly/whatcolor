import { Link } from 'react-router-dom'
import Hero from './Hero'
import HowItWorks from './HowItWorks'
import Features from './Features'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Hero />
      <HowItWorks />
      <Features />

      {/* Footer */}
      <footer className="border-t border-dark-border px-6 py-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            <span className="text-white font-bold"><span className="font-normal">What</span>Color.io</span>
            {' '}— See More. Know More.
          </div>
          <p className="text-xs text-gray-700">Built by a colorblind developer, for colorblind people.</p>
          <div className="flex gap-5 text-xs text-gray-600">
            <Link to="/settings" className="hover:text-white transition-colors">Settings</Link>
            <Link to="/app" className="hover:text-white transition-colors">Open App</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
