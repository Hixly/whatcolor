import { useInView } from '../../hooks/useInView'

const RAINBOW = 'linear-gradient(90deg, #FF3B30, #FF9500, #FFD60A, #30D158, #0A84FF, #BF5AF2)'

export default function FounderNote() {
  const [ref, inView] = useInView()
  return (
    <section ref={ref} className="px-4 sm:px-6 py-14 md:py-16">
      <div className={`relative max-w-2xl mx-auto rounded-[2rem] glass-light p-8 md:p-11 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="w-12 h-1 rounded-full mb-5" style={{ background: RAINBOW }} />

        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-5">Why I built this</p>

        <div className="font-essay space-y-3 text-gray-700 text-2xl md:text-3xl leading-snug">
          <p>
            i&apos;m <span className="font-semibold text-gray-900">colorblind</span>, the strong red-green kind. for
            years, figuring out a color meant guessing, asking somebody, or just not knowing.
          </p>
          <p>
            so i built the thing i always wanted in my pocket. then i used it every day and noticed it talked
            like a paint catalog. it called a maroon hoodie &ldquo;taupe.&rdquo;
          </p>
          <p>
            so i rebuilt the whole engine. now it says what a friend would say (navy, olive, dusty rose), and
            when a color is about to trick me, it tells me what it could pass for with my eyes.
          </p>
        </div>

        <blockquote className="font-essay text-gray-900 text-2xl md:text-3xl leading-snug mt-6">
          <span aria-hidden className="font-bold mr-1.5" style={{ color: '#FF3B30' }}>&ldquo;</span>it&apos;s the tool
          i needed. if you see the world a little different too, it&apos;s yours. free, forever.<span aria-hidden className="font-bold ml-1" style={{ color: '#BF5AF2' }}>&rdquo;</span>
        </blockquote>

        <div className="mt-8 pt-6 border-t border-black/5">
          <p className="font-essay font-bold text-3xl text-gray-900 leading-none">Hix</p>
          <p className="text-sm text-gray-400 leading-tight mt-1.5">Colorblind, and maker of WhatColor</p>
        </div>
      </div>
    </section>
  )
}
