// Turning camera or photo pixels into one trustworthy color.
import { srgbToLinear, linearToSrgb } from './colorMath'

const GRID = 24 // the sampled region is resampled to GRID×GRID before averaging
const TRIM = 0.15 // drop the brightest and darkest 15%: glare and shadow

/**
 * Robust average of RGBA pixel data, done in linear light (averaging gamma
 * values skews toward dark). Pixels are ranked by luminance and the extremes
 * trimmed, so a glint on a shiny surface or a shadowed fold doesn't drag the
 * answer. Optional white-balance gains are applied per channel in linear RGB.
 */
export function robustAverage(data, gains = null) {
  const n = data.length / 4
  const px = new Array(n)
  for (let i = 0; i < n; i++) {
    const r = srgbToLinear(data[i * 4])
    const g = srgbToLinear(data[i * 4 + 1])
    const b = srgbToLinear(data[i * 4 + 2])
    px[i] = { r, g, b, y: 0.2126 * r + 0.7152 * g + 0.0722 * b }
  }
  px.sort((p, q) => p.y - q.y)
  const cut = Math.floor(n * TRIM)
  const kept = px.slice(cut, n - cut)
  let r = 0, g = 0, b = 0
  for (const p of kept) { r += p.r; g += p.g; b += p.b }
  r /= kept.length; g /= kept.length; b /= kept.length
  if (gains) {
    r = Math.min(1, r * gains.r)
    g = Math.min(1, g * gains.g)
    b = Math.min(1, b * gains.b)
  }
  return { r: linearToSrgb(r), g: linearToSrgb(g), b: linearToSrgb(b), linear: { r, g, b } }
}

// The reference is white paper, so it should read as white: correct the
// exposure along with the tint, but never brighten more than this.
const WHITE_TARGET = 0.9 // linear luminance, about #F2F2F2
const MAX_EXPOSURE_GAIN = 2.5

/**
 * White-balance gains that turn this reading into white, or { error } if it's
 * too dark or too colorful to be a plausible white reference.
 */
export function gainsFromReference(linear) {
  const { r, g, b } = linear
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  if (y < 0.08) return { error: 'too-dark' }
  // Tungsten light can make white paper read 4x more red than blue in linear
  // light, so only reject references that are unmistakably colored.
  if (min <= 0 || max / min > 5) return { error: 'too-colorful' }
  const k = Math.min(MAX_EXPOSURE_GAIN, WHITE_TARGET / y)
  return { gains: { r: (k * y) / r, g: (k * y) / g, b: (k * y) / b } }
}

/**
 * Where a point on screen lands in the source image, for an element drawn with
 * object-fit: cover (the camera) or contain (an uploaded photo).
 */
export function screenToSource(px, py, box, src, fit = 'cover') {
  const scale = fit === 'cover'
    ? Math.max(box.width / src.width, box.height / src.height)
    : Math.min(box.width / src.width, box.height / src.height)
  const offX = (box.width - src.width * scale) / 2
  const offY = (box.height - src.height * scale) / 2
  const x = (px - offX) / scale
  const y = (py - offY) / scale
  const inside = x >= 0 && y >= 0 && x <= src.width && y <= src.height
  return { x, y, scale, inside }
}

/** Reusable reader: draws a square region of `source` small, then averages it. */
export function createSampler() {
  let ctx = null
  return function sampleRegion(source, cx, cy, size, gains = null) {
    if (!ctx) {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = GRID
      ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
    }
    const w = source.videoWidth || source.naturalWidth || source.width
    const h = source.videoHeight || source.naturalHeight || source.height
    // Keep the whole region inside the frame; pixels outside it would read
    // as transparent black and drag the average down.
    const s = Math.max(1, Math.min(size, w, h))
    const x = Math.min(Math.max(cx - s / 2, 0), w - s)
    const y = Math.min(Math.max(cy - s / 2, 0), h - s)
    ctx.clearRect(0, 0, GRID, GRID)
    ctx.drawImage(source, x, y, s, s, 0, 0, GRID, GRID)
    return robustAverage(ctx.getImageData(0, 0, GRID, GRID).data, gains)
  }
}

/** Sample-spot sizes, as a fraction of the shorter side of the frame. */
export const SPOT_SIZES = { small: 0.025, medium: 0.05, large: 0.09 }
