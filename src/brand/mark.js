// The WhatColor mark, defined once and used everywhere: the React logo, the
// camera reticle, and the favicon / app-icon files (scripts/build-brand.mjs).
//
// A full-spectrum ring, four crosshair ticks, and a hollow center: the circle
// in the middle is the spot the app reads, so the logo shows how it works.
// No imports on purpose, so Node can load this file directly.

export const INK = '#1C1C1E'

// Brand spectrum, clockwise from about 11 o'clock (matches the original mark).
const STOPS = ['#FF3B30', '#FF9500', '#FFD60A', '#30D158', '#00C7BE', '#0A84FF', '#5E5CE6', '#BF5AF2', '#FF2D55', '#FF3B30']
const START_DEG = -110
const SEGMENTS = 96

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const toLin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const toSrgb = (v) => Math.round(Math.min(1, Math.max(0, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)) * 255)
const toHex = (rgb) => '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('')

// Blend in linear light so the ring doesn't get muddy between stops.
function mix(a, b, t) {
  const A = hex(a).map(toLin), B = hex(b).map(toLin)
  return toHex(A.map((v, i) => toSrgb(v + (B[i] - v) * t)))
}

function colorAt(f) {
  const x = f * (STOPS.length - 1)
  const i = Math.min(STOPS.length - 2, Math.floor(x))
  return mix(STOPS[i], STOPS[i + 1], x - i)
}

const r2 = (n) => Math.round(n * 1000) / 1000

function arc(cx, cy, r0, r1, a0, a1) {
  const p = (r, a) => [r2(cx + r * Math.cos(a)), r2(cy + r * Math.sin(a))]
  const [x0, y0] = p(r1, a0), [x1, y1] = p(r1, a1)
  const [x2, y2] = p(r0, a1), [x3, y3] = p(r0, a0)
  return `M${x0} ${y0}A${r1} ${r1} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 0 0 ${x3} ${y3}Z`
}

/** Ring segments on a 100x100 canvas. */
export function ringSegments({ outer = 40, inner = 29, cx = 50, cy = 50 } = {}) {
  const out = []
  for (let i = 0; i < SEGMENTS; i++) {
    const a0 = ((START_DEG + (i * 360) / SEGMENTS) * Math.PI) / 180
    const a1 = a0 + (2 * Math.PI) / SEGMENTS + 0.006 // hairline overlap, no seams
    out.push({ d: arc(cx, cy, inner, outer, a0, a1), fill: colorAt((i + 0.5) / SEGMENTS) })
  }
  return out
}

// Ticks cross the ring like the original crosshair.
export const TICKS = [
  [50, 4, 50, 25],
  [50, 75, 50, 96],
  [4, 50, 25, 50],
  [75, 50, 96, 50],
]
export const TICK_WIDTH = 6.5
export const CENTER = { r: 9.5, stroke: 5 }

/** Standalone SVG markup for the mark (used to generate the static files). */
export function markSvg({ size = 100, background = null, radius = 22, scale = 1, ink = INK } = {}) {
  const inset = (100 - 100 * scale) / 2
  const g = `<g transform="translate(${r2(inset)} ${r2(inset)}) scale(${scale})">` +
    ringSegments().map((s) => `<path d="${s.d}" fill="${s.fill}"/>`).join('') +
    TICKS.map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" stroke-width="${TICK_WIDTH}" stroke-linecap="round"/>`).join('') +
    `<circle cx="50" cy="50" r="${CENTER.r}" fill="none" stroke="${ink}" stroke-width="${CENTER.stroke}"/>` +
    '</g>'
  const bg = background ? `<rect width="100" height="100" rx="${radius}" fill="${background}"/>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">${bg}${g}</svg>`
}
