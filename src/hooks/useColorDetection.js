import { useRef, useState, useCallback, useEffect } from 'react'
import { rgbToHsl, formatHex, formatRgb, formatHsl } from '../utils/colorConversions'
import { nearestColorName } from '../utils/colorNames'
import { descriptiveName, contextualReference } from '../utils/colorDescriptions'
import { getConfusionWarning } from '../utils/confusionPairs'

// Exponential moving average — blends new sample with running smooth value.
// alpha=0.25 means 25% new data each frame → dampens camera noise while
// still tracking real color changes within ~0.5s (5 frames at 10fps).
const EMA_ALPHA = 0.25

function sampleCanvas(canvas, cx, cy, size) {
  const ctx = canvas.getContext('2d')
  const half = Math.floor(size / 2)
  const imageData = ctx.getImageData(
    Math.max(0, cx - half),
    Math.max(0, cy - half),
    size,
    size
  )
  const d = imageData.data
  let r = 0, g = 0, b = 0
  const count = size * size
  for (let i = 0; i < count * 4; i += 4) {
    r += d[i]; g += d[i + 1]; b += d[i + 2]
  }
  return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) }
}

export function useColorDetection({ videoRef, canvasRef, samplingSize = 3, profile = 'none', active = true }) {
  const [color, setColor] = useState(null)
  const rafRef = useRef(null)
  const frameCount = useRef(0)
  const smoothRef = useRef(null)       // EMA-smoothed RGB
  const confirmedHex = useRef(null)    // last hex we actually displayed
  const pendingHex = useRef(null)      // candidate hex waiting for confirmation
  const pendingCount = useRef(0)       // how many consecutive frames this candidate appeared

  const analyze = useCallback((r, g, b) => {
    const hex = formatHex(r, g, b)
    const hsl = rgbToHsl(r, g, b)
    return {
      r, g, b,
      hex,
      rgb: formatRgb(r, g, b),
      hsl: formatHsl(r, g, b),
      name: nearestColorName(r, g, b),
      descriptive: descriptiveName(r, g, b),
      reference: contextualReference(r, g, b),
      confusion: getConfusionWarning(hsl.h, hsl.s, hsl.l, profile),
    }
  }, [profile])

  // Manual point sample (tap-to-sample) — bypass smoothing, instant result
  const samplePoint = useCallback((x, y) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { r, g, b } = sampleCanvas(canvas, x, y, samplingSize)
    smoothRef.current = { r, g, b }
    const result = analyze(r, g, b)
    confirmedHex.current = result.hex
    pendingHex.current = result.hex
    pendingCount.current = 2
    setColor(result)
  }, [canvasRef, samplingSize, analyze])

  useEffect(() => {
    if (!active) return

    function loop() {
      frameCount.current++
      if (frameCount.current % 6 === 0) {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (video && canvas && video.readyState >= 2) {
          const ctx = canvas.getContext('2d')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0)

          const cx = Math.floor(canvas.width / 2)
          const cy = Math.floor(canvas.height / 2)
          const raw = sampleCanvas(canvas, cx, cy, samplingSize)

          // Apply EMA smoothing
          if (!smoothRef.current) {
            smoothRef.current = raw
          } else {
            smoothRef.current = {
              r: Math.round(EMA_ALPHA * raw.r + (1 - EMA_ALPHA) * smoothRef.current.r),
              g: Math.round(EMA_ALPHA * raw.g + (1 - EMA_ALPHA) * smoothRef.current.g),
              b: Math.round(EMA_ALPHA * raw.b + (1 - EMA_ALPHA) * smoothRef.current.b),
            }
          }

          const { r, g, b } = smoothRef.current
          const hex = formatHex(r, g, b)

          // Require 2 consecutive frames with the same smoothed hex before
          // committing — this stops single-frame noise from flipping the name.
          if (hex === pendingHex.current) {
            pendingCount.current++
          } else {
            pendingHex.current = hex
            pendingCount.current = 1
          }

          if (pendingCount.current >= 2 && hex !== confirmedHex.current) {
            confirmedHex.current = hex
            setColor(analyze(r, g, b))
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, videoRef, canvasRef, samplingSize, analyze])

  return { color, samplePoint }
}
