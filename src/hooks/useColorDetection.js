import { useRef, useState, useCallback, useEffect } from 'react'
import { rgbToHsl, formatHex, formatRgb, formatHsl } from '../utils/colorConversions'
import { nearestColorName } from '../utils/colorNames'
import { descriptiveName, contextualReference } from '../utils/colorDescriptions'
import { getConfusionWarning } from '../utils/confusionPairs'

// Adaptive EMA: slow (0.70) when camera is steady — strong smoothing, fewer
// spurious updates. Fast (0.85) when a real color shift is detected (raw diff
// across channels exceeds CHANGE_THRESHOLD). Reverts to slow once settled.
const EMA_SLOW = 0.70
const EMA_FAST = 0.85
const CHANGE_THRESHOLD = 25  // total RGB delta that signals a real shift

// Name gate: new name must hold for NAME_FRAMES consecutive samples before
// it replaces the confirmed name. Prevents boundary flicker.
const NAME_FRAMES = 3

// Hold time: once a name is confirmed, it stays for at least HOLD_MS.
// Caps involuntary name changes when scanning to ~2-3 per second.
const HOLD_MS = 400

// Median of an array — robust against single-pixel compression spikes.
function median(arr) {
  arr.sort((a, b) => a - b)
  return arr[Math.floor(arr.length / 2)]
}

// Sample a size×size region around (cx, cy) and return the per-channel median.
// Median is far more resistant to JPEG/H.264 block artifacts than the mean.
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
  const rs = [], gs = [], bs = []
  const count = size * size
  for (let i = 0; i < count * 4; i += 4) {
    rs.push(d[i]); gs.push(d[i + 1]); bs.push(d[i + 2])
  }
  return { r: median(rs), g: median(gs), b: median(bs) }
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

  // Tap-to-sample — bypass smoothing and gates for instant response
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
      if (frameCount.current % 2 === 0) {  // ~30 fps
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

          // Adaptive EMA: fast when a real change is detected, slow otherwise.
          if (!smoothRef.current) {
            smoothRef.current = raw
          } else {
            const diff =
              Math.abs(raw.r - smoothRef.current.r) +
              Math.abs(raw.g - smoothRef.current.g) +
              Math.abs(raw.b - smoothRef.current.b)
            const alpha = diff > CHANGE_THRESHOLD ? EMA_FAST : EMA_SLOW
            smoothRef.current = {
              r: Math.round(alpha * raw.r + (1 - alpha) * smoothRef.current.r),
              g: Math.round(alpha * raw.g + (1 - alpha) * smoothRef.current.g),
              b: Math.round(alpha * raw.b + (1 - alpha) * smoothRef.current.b),
            }
          }

          const { r, g, b } = smoothRef.current
          const analyzed = analyze(r, g, b)

          // 3-frame name gate
          if (analyzed.name !== pendingName.current) {
            pendingName.current = analyzed.name
            pendingCount.current = 1
          } else {
            pendingCount.current++
          }

          // 400 ms hold before any name change is allowed
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
