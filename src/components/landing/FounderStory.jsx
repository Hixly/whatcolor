import { useInView } from '../../hooks/useInView'

export default function FounderStory() {
  const [ref, inView] = useInView({ threshold: 0.2 })

  return (
    <section ref={ref} className="px-6 py-24 md:py-32">
      <div
        className={`relative mx-auto max-w-5xl transition-all duration-1000 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="glass-panel rounded-[2rem] md:rounded-[2.75rem] px-8 py-12 md:px-14 md:py-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-purple/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-brand-blue/8 blur-3xl pointer-events-none" />

          <div className="relative grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-10 md:gap-16 items-start">
            <div className="space-y-6">
              <p className="section-eyebrow">Why I built this</p>
              <blockquote className="font-serif text-[1.75rem] md:text-[2.35rem] lg:text-[2.65rem] leading-[1.12] tracking-[-0.02em] text-gray-900">
                <span className="text-brand-orange/80 text-[1.4em] leading-none align-[-0.08em] mr-1">
                  &ldquo;
                </span>
                I&apos;m colorblind. I got tired of guessing what color something was
                <span className="text-brand-blue/70">&rdquo;</span>
              </blockquote>
            </div>

            <div className="space-y-5 text-[15px] md:text-base text-gray-500 font-light leading-[1.75] md:pt-2">
              <p>
                WhatColor started on my phone, not in a pitch deck. I wanted to point at a shirt, a wall,
                a flower — and hear the name without opening three apps or asking someone again.
              </p>
              <p>
                So I built the tool I actually reach for: open the camera, aim, know. No account, no
                upload, no &ldquo;AI magic&rdquo; slide deck. Just something that works when my eyes
                don&apos;t.
              </p>
              <p className="text-sm text-gray-400 pt-1">
                Built by a colorblind developer, for colorblind people.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
