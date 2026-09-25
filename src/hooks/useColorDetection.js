import { useRef, useState, useCallback, useEffect } from 'react'
import { identify } from '../engine/identify'
import { createSampler, screenToSource, gainsFromReference, SPOT_SIZES } from '../engine/sampler'
import { rgbToOklab, oklabToRgb, deltaEOK } from '../engine/colorMath'

const FRAME_MS = 50 // ~20 readings a second is plenty and easy on the battery
const NAME_FRAMES = 3 // a new name must win this many readings in a row
const HOLD_MARGIN = 0.05 // while a new name is still proving itself, keep the old one
const UI_MS = 120 // hex-only UI refreshes are throttled to this
const WB_KEY = 'wc_white_balance'

function loadGains() {
  try {
    return JSON.parse(sessionStorage.getItem(WB_KEY)) || null
  } catch {
    return null
  }
}

/**
 * Live color reading from a <video>, sampled exactly under `aimRef` (the
 * reticle element), wherever the layout puts it.
 */
export function useColorDetection({ videoRef, aimRef, spot = 'medium', engine, active = true }) {
  const [color, setColor] = useState(null)
  const [spotPx, setSpotPx] = useState(40)
  const [whiteBalanced, setWhiteBalanced] = useState(() => !!loadGains())
  const [sampler] = useState(createSampler)
  const gainsRef = useRef(loadGains())
  const smoothRef = useRef(null)
  const confirmedRef = useRef(null)
  const pendingRef = useRef({ name: null, count: 0 })
  const lastUiRef = useRef(0)
  const engineRef = useRef(engine)
  useEffect(() => { engineRef.current = engine }, [engine])

  // Where the reticle's center falls in video pixels, and how big the sample is.
  const locate = useCallback((clientX, clientY) => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return null
    const vr = video.getBoundingClientRect()
    let px = vr.width / 2, py = vr.height / 2
    if (clientX != null) {
      px = clientX - vr.left
      py = clientY - vr.top
    } else if (aimRef?.current) {
      const ar = aimRef.current.getBoundingClientRect()
      px = ar.left + ar.width / 2 - vr.left
      py = ar.top + ar.height / 2 - vr.top
    }
    const src = { width: video.videoWidth, height: video.videoHeight }
    const p = screenToSource(px, py, vr, src, 'cover')
    const size = Math.min(src.width, src.height) * (SPOT_SIZES[spot] || SPOT_SIZES.medium)
    return { ...p, size, video }
  }, [videoRef, aimRef, spot])

  const read = useCallback((loc, useGains = true) => {
    return sampler(loc.video, loc.x, loc.y, loc.size, useGains ? gainsRef.current : null)
  }, [sampler])

  const commit = useCallback((result) => {
    confirmedRef.current = result.name
    lastUiRef.current = performance.now()
    setColor(result)
  }, [])

  // Live loop.
  useEffect(() => {
    if (!active) return undefined
    let raf = 0
    let last = 0
    const tick = (t) => {
      raf = requestAnimationFrame(tick)
      if (t - last < FRAME_MS) return
      last = t
      const video = videoRef.current
      if (!video || video.readyState < 2) return
      const loc = locate()
      if (!loc) return
      const nextSpot = Math.round(loc.size * loc.scale)
      setSpotPx((prev) => (Math.abs(prev - nextSpot) > 1 ? nextSpot : prev))
      const raw = read(loc)

      // Smooth in OKLab: react fast to a real change, sit still on noise.
      const lab = rgbToOklab(raw.r, raw.g, raw.b)
      const prev = smoothRef.current
      if (!prev) {
        smoothRef.current = lab
      } else {
        const jump = deltaEOK(lab, prev)
        const a = jump > 0.08 ? 0.7 : jump > 0.03 ? 0.4 : 0.2
        smoothRef.current = {
          L: prev.L + (lab.L - prev.L) * a,
          a: prev.a + (lab.a - prev.a) * a,
          b: prev.b + (lab.b - prev.b) * a,
        }
      }
      const s = smoothRef.current
      const rgb = oklabToRgb(s.L, s.a, s.b)
      const opts = engineRef.current
      const held = confirmedRef.current
      let result = identify(rgb.r, rgb.g, rgb.b, { ...opts, stickTo: held })

      if (held && result.name !== held) {
        const pending = pendingRef.current
        if (pending.name === result.name) pending.count++
        else pendingRef.current = { name: result.name, count: 1 }
        if (pendingRef.current.count < NAME_FRAMES) {
          // Not proven yet: keep showing the held name if it's still close.
          const keep = identify(rgb.r, rgb.g, rgb.b, { ...opts, stickTo: held, stickMargin: HOLD_MARGIN })
          if (keep.name === held) result = keep
        }
      } else {
        pendingRef.current = { name: null, count: 0 }
      }

      const now = performance.now()
      if (result.name !== confirmedRef.current) {
        commit(result)
        // Browsers block vibration until the user has touched the page.
        if (navigator.vibrate && navigator.userActivation?.hasBeenActive) navigator.vibrate(8)
      } else if (now - lastUiRef.current > UI_MS) {
        lastUiRef.current = now
        setColor((c) => (c && c.hex === result.hex && c.confusion === result.confusion ? c : result))
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, videoRef, locate, read, commit])

  /** Sample a tapped point (used while the frame is frozen). */
  const samplePoint = useCallback((clientX, clientY) => {
    const loc = locate(clientX, clientY)
    if (!loc || !loc.inside) return null
    const raw = read(loc)
    smoothRef.current = rgbToOklab(raw.r, raw.g, raw.b)
    const result = identify(raw.r, raw.g, raw.b, engineRef.current)
    commit(result)
    return result
  }, [locate, read, commit])

  /** Use whatever is under the reticle as the white reference. */
  const calibrateWhite = useCallback(() => {
    const loc = locate()
    if (!loc) return { error: 'no-camera' }
    const raw = read(loc, false)
    const out = gainsFromReference(raw.linear)
    if (out.error) return out
    gainsRef.current = out.gains
    try { sessionStorage.setItem(WB_KEY, JSON.stringify(out.gains)) } catch { /* no-op */ }
    smoothRef.current = null
    setWhiteBalanced(true)
    return { ok: true }
  }, [locate, read])

  const resetWhite = useCallback(() => {
    gainsRef.current = null
    try { sessionStorage.removeItem(WB_KEY) } catch { /* no-op */ }
    smoothRef.current = null
    setWhiteBalanced(false)
  }, [])

  return { color, samplePoint, spotPx, calibrateWhite, resetWhite, whiteBalanced }
}
