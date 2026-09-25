import { useInView } from '../../hooks/useInView'
import { TargetIcon, ScanIcon, SparkleIcon } from '../ui/Icons'

const STEPS = [
  {
    Icon: TargetIcon,
    step: '01',
    title: 'Point',
    desc: 'Aim the reticle at anything. The circle in the middle is exactly the spot that gets read, so you always know what you are measuring.',
    accent: '#FF3B30',
  },
  {
    Icon: ScanIcon,
    step: '02',
    title: 'Read',
    desc: 'WhatColor averages that spot the way your eyes blend it, skipping glare and shadow. Under warm bulbs, one tap of Set white corrects the light.',
    accent: '#0A84FF',
  },
  {
    Icon: SparkleIcon,
    step: '03',
    title: 'Know',
    desc: 'You get the everyday name, its basic color family, a plain description, and a heads-up tuned to your own color vision.',
    accent: '#30D158',
  },
]

export default function HowItWorks() {
  const [ref, inView] = useInView()
  return (
    <section id="how-it-works" ref={ref} className="px-4 sm:px-6 py-20 md:py-24 max-w-5xl mx-auto scroll-mt-20">
      <div className={`text-center mb-14 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">How it works</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Three steps. Zero guessing.</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {STEPS.map(({ Icon, step, title, desc, accent }, i) => (
          <div
            key={step}
            className={`relative flex flex-col gap-5 p-7 glass-light rounded-3xl hover:-translate-y-1 transition-all duration-300 group ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: inView ? `${i * 120}ms` : '0ms' }}
          >
            <div className="flex items-center justify-between">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${accent}1f`, color: accent }}
              >
                <Icon size={20} strokeWidth={2} />
              </div>
              <span className="text-4xl font-bold transition-colors select-none tabular-nums" style={{ color: `${accent}33` }}>
                {step}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-light">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
