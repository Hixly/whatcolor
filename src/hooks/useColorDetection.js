import { useRef, useState, useCallback, useEffect } from 'react'
import { rgbToHsl, formatHex, formatRgb, formatHsl } from '../utils/colorConversions'
import { nearestColorName } from '../utils/colorNames'
import { descriptiveName, contextualReference } from '../utils/colorDescriptions'
import { getConfusionWarning } from '../utils/confusionPairs'

// EMA alpha=0.80 — 80% new data per sample at 30fps.
// Name gate: must match 3 consecutive frames (~100ms) before confirming.
// Hold time: once confirmed, name stays for at least 400ms before it can
// change again. Prevents flicker when scanning across color boundaries.
const EMA_ALPHA = 0.80
const NAME_FRAMES = 3
const HOLD_MS = 400

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
  const smoothRef = useRef(null)
  const pendingName = useRef(null)
  const pendingCount = useRef(0)
  const confirmedName = useRef(null)
  const confirmedHex = useRef(null)
  const confirmedAt = useRef(0)

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

  // Tap-to-sample — skip smoothing and gates, show result immediately
  const samplePoint = useCallback((x, y) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { r, g, b } = sampleCanvas(canvas, x, y, samplingSize)
    smoothRef.current = { r, g, b }
    const result = analyze(r, g, b)
    confirmedName.current = result.name
    confirmedHex.current = result.hex
    confirmedAt.current = Date.now()
    pendingName.current = result.name
    pendingCount.current = NAME_FRAMES
    setColor(result)
  }, [canvasRef, samplingSize, analyze])

  useEffect(() => {
    if (!active) return

    function loop() {
      frameCount.current++
      // ~30fps: sample every 2 frames
      if (frameCount.current % 2 === 0) {
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

          // EMA smooth
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
          const analyzed = analyze(r, g, b)

          // 3-frame name gate: new name must appear 3 consecutive samples
          if (analyzed.name !== pendingName.current) {
            pendingName.current = analyzed.name
            pendingCount.current = 1
          } else {
            pendingCount.current++
          }

          // 400ms hold: confirmed name stays locked until hold expires,
          // then the 3-frame gate must pass again for any new name.
          const holdExpired = Date.now() - confirmedAt.current >= HOLD_MS
          const nameReady = pendingCount.current >= NAME_FRAMES && holdExpired
          const nameChanged = nameReady && analyzed.name !== confirmedName.current
          const hexChanged = analyzed.hex !== confirmedHex.current

          if (nameChanged) {
            confirmedName.current = analyzed.name
            confirmedAt.current = Date.now()
          }

          if (nameChanged || hexChanged) {
            confirmedHex.current = analyzed.hex
            setColor({
              ...analyzed,
              name: confirmedName.current || analyzed.name,
            })
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
