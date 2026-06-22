import { useEffect, useState } from 'react'

/** 0 → 1 scroll progress while `ref` travels through the viewport. */
export function useSectionScrollProgress(ref) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const update = () => {
      const rect = el.getBoundingClientRect()
      const viewport = window.innerHeight
      const travel = rect.height - viewport * 0.35
      if (travel <= 0) {
        setProgress(0)
        return
      }
      const scrolled = -rect.top + viewport * 0.15
      setProgress(Math.min(1, Math.max(0, scrolled / travel)))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ref])

  return progress
}
