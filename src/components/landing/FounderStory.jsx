import { useInView } from '../../hooks/useInView'

export default function FounderStory() {
  const [ref, inView] = useInView({ threshold: 0.2 })

  return (
    <section ref={ref} className="px-6 py-20 md:py-24">
      <div
        className={`relative mx-auto max-w-5xl transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="glass-panel rounded-[1.75rem] md:rounded-[2rem] px-7 py-10 md:px-12 md:py-14 overflow-hidden">
          <div className="grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-8 md:gap-12 items-start text-center md:text-left">
            <div className="space-y-5">
              <p className="section-eyebrow">Why I built this</p>
              <blockquote className="font-serif text-[1.6rem] sm:text-[1.85rem] md:text-[2.2rem] leading-[1.15] tracking-[-0.02em] text-gray-900">
                <span className="text-brand-orange/80 text-[1.35em] leading-none align-[-0.08em] mr-1">
                  &ldquo;
                </span>
                I&apos;m colorblind. I got tired of guessing what color something was
                <span className="text-brand-blue/70">&rdquo;</span>
              </blockquote>
            </div>

            <div className="space-y-4 text-[15px] md:text-base text-gray-500 font-light leading-[1.7] md:pt-1">
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
