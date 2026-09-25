import { useInView } from '../../hooks/useInView'
import { BEFORE_AFTER } from './demoColors'

// Benchmark: family agreement with the XKCD color survey (784 colors whose
// names contain a color word). Reproduced by src/engine/__tests__/xkcdBenchmark.
const STATS = [
  { big: '94%', label: 'of survey colors land in a family people used for them', sub: 'up from 76% with the old engine' },
  { big: '155', label: 'everyday color names', sub: 'navy, olive, dusty rose. No "PapayaWhip".' },
  { big: '3', label: 'kinds of color blindness simulated', sub: 'so warnings match your eyes' },
]

export default function EngineUpgrade() {
  const [ref, inView] = useInView()
  return (
    <section id="engine" ref={ref} className="px-4 sm:px-6 py-20 md:py-24 max-w-5xl mx-auto scroll-mt-20">
      <div className={`text-center mb-12 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">The new engine</p>
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-[1.08]">
          Talks like a person,
          <br />
          <span className="font-light text-gray-400">not a paint catalog.</span>
        </h2>
        <p className="mt-5 text-gray-500 text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
          The first version picked names from a web developer&apos;s color list. It called a maroon hoodie
          &ldquo;Taupe&rdquo; and khaki pants &ldquo;Sage.&rdquo; The rebuilt engine measures color the way eyes
          see it and answers in the words people actually use.
        </p>
      </div>

      <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-4 md:gap-5 items-start">
        {/* Before / after */}
        <div
          className={`glass-light rounded-3xl p-2 md:p-3 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: inView ? '120ms' : '0ms' }}
        >
          <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 md:gap-x-5 px-3 md:px-4 pt-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span className="w-10" />
            <span>Before</span>
            <span>Now</span>
          </div>
          <ul className="flex flex-col">
            {BEFORE_AFTER.map((row) => (
              <li
                key={row.hex}
                className="grid grid-cols-[auto_1fr_1fr] items-center gap-x-3 md:gap-x-5 px-3 md:px-4 py-3 rounded-2xl hover:bg-white/60 transition-colors"
              >
                <span
                  className="w-10 h-10 rounded-xl shrink-0"
                  style={{ backgroundColor: row.hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }}
                  title={row.thing}
                />
                <span className="min-w-0">
                  <span className="block text-[11px] text-gray-400 truncate">{row.thing}</span>
                  <span className="block text-sm md:text-base text-gray-400 line-through decoration-red-400/70 decoration-[1.5px] truncate">{row.before}</span>
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] text-gray-400 truncate">{row.now.family} family</span>
                  <span className="block text-sm md:text-base font-semibold text-gray-900 truncate">{row.now.name}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats */}
        <div className="grid gap-3">
          {STATS.map((s, i) => (
            <div
              key={s.big}
              className={`glass-light rounded-3xl px-6 py-5 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: inView ? `${200 + i * 90}ms` : '0ms' }}
            >
              <p className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 tabular-nums">{s.big}</p>
              <p className="mt-1 text-sm font-medium text-gray-700 leading-snug">{s.label}</p>
              <p className="mt-0.5 text-xs text-gray-400 leading-snug">{s.sub}</p>
            </div>
          ))}
          <p className="text-[11px] text-gray-400 leading-relaxed px-2">
            Measured against the XKCD color survey, where over 200,000 people named colors in their own
            words. 784 colors with a color word in their name.
          </p>
        </div>
      </div>
    </section>
  )
}
