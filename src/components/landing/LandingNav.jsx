import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CameraIcon } from '../ui/Icons'

const TABS = [
  { label: 'Try it',       href: '#try' },
  { label: 'How it works', href: '#how-it-works', wide: true },
  { label: 'Features',     href: '#features' },
]

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300"
      style={{ width: 'max-content' }}
    >
      <div
        className={`flex items-center gap-1 p-1 rounded-full glass-light transition-all duration-300 ease-soft ${
          scrolled ? 'shadow-lg shadow-black/10' : ''
        }`}
      >
        {/* Tab links — springy pill hover */}
        {TABS.map(({ label, href, wide }) => (
          <button
            key={href}
            onClick={() => scrollTo(href.slice(1))}
            className={`${wide ? 'hidden sm:block' : ''} px-3.5 sm:px-4 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-black/[0.06] transition-all duration-200 ease-spring active:scale-95 whitespace-nowrap`}
          >
            {label}
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-4 bg-black/10 mx-1" />

        {/* Get Started CTA — molded pill with icon micro-motion */}
        <Link
          to="/app"
          className="group/nav flex items-center gap-1.5 pl-3.5 pr-4 py-1.5 bg-[#111] text-white text-sm font-semibold rounded-full raised-dark hover:bg-black transition-all duration-200 ease-spring whitespace-nowrap active:scale-95 active:duration-75"
        >
          <CameraIcon size={13} strokeWidth={2} className="transition-transform duration-300 ease-spring group-hover/nav:rotate-[-10deg] group-hover/nav:scale-110" />
          Get Started
        </Link>
      </div>
    </div>
  )
}
