import { Link } from 'react-router-dom'
import { useInView } from '../../hooks/useInView'
import { CameraIcon, UploadIcon, EyeIcon, CompareIcon, HistoryIcon, LockIcon, TargetIcon, CheckIcon } from '../ui/Icons'
import TrustPills from './TrustPills'

const FEATURES = [
  { Icon: CameraIcon,  title: 'Real-Time Detection',   desc: 'Live color identification as you move your camera. No tapping required.', accent: '#FF3B30' },
  { Icon: UploadIcon,  title: 'Image Upload',          desc: 'Upload any photo and tap anywhere to identify colors.', accent: '#FF9500' },
  { Icon: EyeIcon,     title: 'Colorblind Awareness',  desc: 'Set your profile once — get warnings when a color falls in your confusion zone.', accent: '#FFD60A' },
  { Icon: CompareIcon, title: 'Color Comparison',      desc: 'Compare two colors side-by-side with WCAG contrast ratios.', accent: '#30D158' },
  { Icon: HistoryIcon, title: 'Color History',         desc: 'Save, label, and export your color palette as JSON.', accent: '#0A84FF' },
  { Icon: TargetIcon,  title: 'Light & Dark Mode',     desc: 'High contrast UI in both modes. Accessibility-first by design.', accent: '#BF5AF2' },
  { Icon: LockIcon,    title: '100% Private',          desc: 'All processing on-device. Your camera never leaves your phone.', accent: '#636366' },
  { Icon: CheckIcon,   title: 'Free Forever',          desc: 'No paywall, no ads, no account required. Ever.', accent: '#34C759' },
]

export default function Features() {
  const [ref, inView] = useInView()
  return (
    <>
      <section ref={ref} className="px-6 py-24 max-w-5xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="section-eyebrow mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Everything you need to see clearly.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ Icon, title, desc, accent }, i) => (
            <div
              key={title}
              className={`flex flex-col gap-3 p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:-translate-y-1 hover:border-gray-200 transition-all duration-300 group ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: inView ? `${i * 60}ms` : '0ms' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                <Icon size={16} strokeWidth={2} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-light">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20 md:pb-24">
        <div className="max-w-3xl mx-auto text-center glass-panel rounded-[1.75rem] px-7 py-12 md:px-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">
            See color clearly.
          </h2>
          <p className="text-gray-500 font-light mb-7 max-w-md mx-auto text-sm md:text-base">
            Free, private, and on-device. Start identifying colors in seconds.
          </p>
          <TrustPills className="mb-7 justify-center" />
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/app"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#111] text-white font-semibold rounded-full hover:bg-black transition-all duration-200 hover:-translate-y-0.5 text-base"
            >
              <CameraIcon size={18} />
              Start Detecting Colors
            </Link>
            <Link
              to="/app?mode=upload"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-gray-800 font-semibold rounded-full border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 text-base"
            >
              <UploadIcon size={18} />
              Upload an Image
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
