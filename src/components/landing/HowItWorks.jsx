import { useInView } from '../../hooks/useInView'
import { TargetIcon, ScanIcon, SparkleIcon } from '../ui/Icons'

const STEPS = [
  {
    Icon: TargetIcon,
    step: '01',
    title: 'Point',
    desc: 'Open your camera and aim the crosshair at any color you want to identify.',
    accent: '#FF3B30',
  },
  {
    Icon: ScanIcon,
    step: '02',
    title: 'Detect',
    desc: 'The crosshair samples the color in real-time — no button to press, no waiting.',
    accent: '#0A84FF',
  },
  {
    Icon: SparkleIcon,
    step: '03',
    title: 'Know',
    desc: 'Get the plain-language name, hex values, and a heads-up if your type might confuse it.',
    accent: '#30D158',
  },
]

export default function HowItWorks() {
  const [ref, inView] = useInView()
  return (
    <section ref={ref} className="px-6 py-24 max-w-5xl mx-auto">
      <div className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <p className="section-eyebrow mb-3">How it works</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Three steps. Zero friction.
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {STEPS.map(({ Icon, step, title, desc, accent }, i) => (
          <div
            key={step}
            className={`relative flex flex-col gap-5 p-7 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: inView ? `${i * 120}ms` : '0ms' }}
          >
            <div className="flex items-center justify-between">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                <Icon size={20} strokeWidth={2} />
              </div>
              <span className="text-4xl font-bold text-gray-100 group-hover:text-gray-200 transition-colors select-none tabular-nums">
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
