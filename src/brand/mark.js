// The WhatColor mark, defined once and used everywhere: the logo, the camera
// reticle, and the favicon / app-icon files (scripts/build-brand.mjs).
//
// The logo IS the identifier: a thin spectrum ring, four white crosshair
// ticks, and a white center circle, all with a dark outline so they read on
// any background. In the app the center circle is exactly the spot that
// gets read. No imports on purpose, so Node can load this file directly.

export const OUTLINE = '#111111'
export const CENTER_OUTLINE = 'rgba(0,0,0,0.7)'
export const CORE = '#ffffff'

// Geometry on a 100x100 canvas.
export const RING = { outer: 46, inner: 36 }
export const CENTER_R = 13
const TICK = [
  [50, 1.5, 50, 17],
  [50, 83, 50, 98.5],
  [1.5, 50, 17, 50],
  [83, 50, 98.5, 50],
]
const TICK_CORE = [
  [50, 3, 50, 15.5],
  [50, 84.5, 50, 97],
  [3, 50, 15.5, 50],
  [84.5, 50, 97, 50],
]
const W = { tick: 4.5, tickCore: 1.6, center: 3.2, centerCore: 1.5 }

// Brand spectrum, clockwise from about 11 o'clock.
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

/** Spectrum ring segments on the 100x100 canvas. */
export function ringSegments({ outer = RING.outer, inner = RING.inner, cx = 50, cy = 50 } = {}) {
  const out = []
  for (let i = 0; i < SEGMENTS; i++) {
    const a0 = ((START_DEG + (i * 360) / SEGMENTS) * Math.PI) / 180
    const a1 = a0 + (2 * Math.PI) / SEGMENTS + 0.006 // hairline overlap, no seams
    out.push({ d: arc(cx, cy, inner, outer, a0, a1), fill: colorAt((i + 0.5) / SEGMENTS) })
  }
  return out
}

/**
 * Everything needed to draw the mark. `weight` thickens the strokes for tiny
 * renditions (favicons) so the white details survive; 1 everywhere else.
 */
export function markParts({ weight = 1, centerR = CENTER_R } = {}) {
  return {
    ring: ringSegments(),
    ticks: { lines: TICK, width: W.tick * weight, color: OUTLINE },
    tickCores: { lines: TICK_CORE, width: W.tickCore * weight, color: CORE },
    center: { r: centerR, width: W.center * weight, color: CENTER_OUTLINE },
    centerCore: { r: centerR, width: W.centerCore * weight, color: CORE },
  }
}

/**
 * Standalone SVG markup (used to generate the static files). `shadow` adds
 * the same soft drop shadow the live reticle has.
 */
export function markSvg({ size = 100, background = null, radius = 22, scale = 1, weight = 1, shadow = false } = {}) {
  const m = markParts({ weight })
  const inset = (100 - 100 * scale) / 2
  const lines = ({ lines: ls, width, color }) =>
    `<g stroke="${color}" stroke-width="${r2(width)}" stroke-linecap="round">` +
    ls.map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`).join('') +
    '</g>'
  const circle = ({ r, width, color }) => `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="${r2(width)}"/>`
  const g = `<g transform="translate(${r2(inset)} ${r2(inset)}) scale(${scale})">` +
    m.ring.map((s) => `<path d="${s.d}" fill="${s.fill}"/>`).join('') +
    lines(m.ticks) + lines(m.tickCores) + circle(m.center) + circle(m.centerCore) +
    '</g>'
  const bg = background ? `<rect width="100" height="100" rx="${radius}" fill="${background}"/>` : ''
  const fx = shadow
    ? '<defs><filter id="wc-ds" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.2" stdDeviation="2.2" flood-color="#000" flood-opacity="0.35"/></filter></defs>'
    : ''
  const body = shadow ? `<g filter="url(#wc-ds)">${g}</g>` : g
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">${fx}${bg}${body}</svg>`
}
