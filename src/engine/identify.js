// The WhatColor naming engine.
//
// identify(r, g, b) answers three questions, in the order a colorblind person
// needs them:
//   1. family       What basic color is this? (Green, Brown, Pink...)
//   2. name         What would a normal person call it? (Olive, Navy, Dusty Rose)
//   3. description  In plain words, what kind of that color? ("dark, muted
//                   yellowish green")
// plus an optional heads-up about colors it can be confused with for the
// user's own type of color vision.
import { rgbToOklab, oklabToOklch, maxChroma, toHex } from './colorMath'
import { PALETTE, FAMILIES } from './palette'
import { simulateRgb, CVD_SHORT } from './cvd'

// Lightness differences matter less for *naming* than hue and chroma do: a
// lighter olive is still olive. Tuned against the XKCD survey (scripts/eval).
const L_WEIGHT = 0.7

function namingDistance(p, q) {
  return Math.hypot((p.L - q.L) * L_WEIGHT, p.a - q.a, p.b - q.b)
}

export function rankNames(lab, limit = 5) {
  const scored = PALETTE.map((entry) => ({ entry, d: namingDistance(lab, entry.lab) }))
  scored.sort((x, y) => x.d - y.d)
  return scored.slice(0, limit)
}

// ── Plain-language description ──────────────────────────────────────────────

// Hue anchors for the chromatic families, taken from each family's base name.
const HUE_ORDER = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink']
const BASE_NAME = { red: 'Red', orange: 'Orange', yellow: 'Yellow', green: 'Green', teal: 'Teal', blue: 'Blue', purple: 'Purple', pink: 'Pink' }
const ANCHOR = Object.fromEntries(
  HUE_ORDER.map((f) => [f, PALETTE.find((e) => e.name === BASE_NAME[f]).lch.h]),
)
const LEAN_WORD = {
  red: 'reddish', orange: 'orange-ish', yellow: 'yellowish', green: 'greenish',
  teal: 'teal-ish', blue: 'bluish', purple: 'purplish', pink: 'pinkish',
}
const HUE_WORD = { ...Object.fromEntries(HUE_ORDER.map((f) => [f, f])), teal: 'blue-green' }

const hueDelta = (from, to) => ((to - from + 540) % 360) - 180

function leanFor(family, h, L) {
  const i = HUE_ORDER.indexOf(family)
  if (i < 0 || family === 'teal') return null
  const prev = HUE_ORDER[(i + HUE_ORDER.length - 1) % HUE_ORDER.length]
  const next = HUE_ORDER[(i + 1) % HUE_ORDER.length]
  const d = hueDelta(ANCHOR[family], h)
  const neighbor = d >= 0 ? next : prev
  const gap = Math.abs(hueDelta(ANCHOR[family], ANCHOR[neighbor]))
  // Only call it out once the hue is well on its way to the neighbor.
  if (Math.abs(d) < gap * 0.38) return null
  if (neighbor === 'teal') return family === 'green' ? 'bluish' : 'greenish'
  // Dark reds leaning toward pink read as berry/wine, i.e. purplish.
  if (family === 'red' && neighbor === 'pink' && L < 0.5) return 'purplish'
  return LEAN_WORD[neighbor]
}

function tintWord(C, h) {
  if (C < 0.012) return null
  if (h >= 30 && h < 105) return 'warm'
  if (h >= 105 && h < 200) return 'green'
  if (h >= 200 && h < 290) return 'blue'
  if (h >= 290 && h < 345) return 'purple'
  return 'pink'
}

function neutralDescription(family, { L, C, h }) {
  const tint = tintWord(C, h)
  if (family === 'white') {
    if (!tint) return L > 0.985 ? 'Pure white' : L > 0.95 ? 'Clean white' : 'Off-white'
    return tint === 'warm' ? 'Warm off-white' : `Off-white with a ${tint} tint`
  }
  if (family === 'black') {
    if (!tint) return L < 0.12 ? 'Deep black' : 'Soft black'
    return `Near black with a ${tint === 'warm' ? 'brown' : tint} tint`
  }
  const shade = L < 0.4 ? 'Dark gray' : L < 0.72 ? 'Medium gray' : 'Light gray'
  if (!tint) return shade
  return tint === 'warm' ? `${shade}, slightly warm` : `${shade} with a ${tint} tint`
}

// The lightness at which a hue is most colorful (its "cusp") and how colorful
// it gets there. Pure yellow peaks near white; pure blue peaks much darker.
const cuspCache = new Map()
function cusp(h) {
  const key = Math.round(h * 2) / 2
  let hit = cuspCache.get(key)
  if (!hit) {
    hit = { L: 0.6, C: 0 }
    for (let l = 0.2; l < 0.999; l += 0.005) {
      const c = maxChroma(l, key)
      if (c > hit.C) hit = { L: l, C: c }
    }
    cuspCache.set(key, hit)
  }
  return hit
}

function lightnessWord(L, family, cp) {
  if (family === 'brown') return L < 0.32 ? 'dark' : L > 0.72 ? 'light' : null
  // Light and dark are judged partly against the hue's own cusp, so a pure
  // yellow isn't "light" and a pure blue isn't "dark", but only halfway, or
  // every olive would come out "very dark".
  const mid = 0.5 * cp.L + 0.3
  if (L < mid) {
    const dark = (mid - L) / mid
    return dark > 0.5 ? 'very dark' : dark > 0.2 ? 'dark' : null
  }
  const light = (L - mid) / (1 - mid)
  return light > 0.62 ? 'very light' : light > 0.3 ? 'light' : null
}

function chromaWord(relC, L) {
  if (relC >= 0.8) return L >= 0.65 ? 'bright' : 'vivid'
  if (relC >= 0.5) return null
  if (relC >= 0.3) return L > 0.75 ? 'soft' : 'muted'
  return L > 0.75 ? 'pale' : 'grayish'
}

function chromaticDescription(family, lch) {
  const { L, C, h } = lch
  const cp = cusp(h)
  // Lighter than the cusp: compare against the cusp itself, so pastels read
  // as soft. Darker: compare against what's possible at that lightness, so a
  // maroon or forest green can still be rich.
  const ref = L > cp.L ? cp.C : maxChroma(L, h)
  const relC = Math.min(1, C / Math.max(1e-6, ref))
  let light = lightnessWord(L, family, cp)
  let chroma = chromaWord(relC, L)
  if (light?.includes('dark') && chroma === 'vivid') { light = null; chroma = 'deep' }
  if (family === 'brown' && (chroma === 'vivid' || chroma === 'bright')) chroma = 'rich'
  if (light?.includes('light') && chroma === 'bright') light = null
  if (light?.includes('light') && (chroma === 'pale' || (light === 'very light' && chroma === 'soft'))) {
    light = null
    chroma = 'pale'
  }
  const words = [light, chroma].filter(Boolean)
  let hue
  if (family === 'brown') {
    hue = h < 50 ? 'reddish brown' : h > 90 ? 'greenish brown' : h > 72 ? 'yellowish brown' : 'brown'
  } else {
    const lean = leanFor(family, h, L)
    hue = lean ? `${lean} ${HUE_WORD[family]}` : HUE_WORD[family]
  }
  const phrase = words.length ? `${words.join(', ')} ${hue}` : hue
  return phrase.charAt(0).toUpperCase() + phrase.slice(1)
}

const NEUTRAL = new Set(['gray', 'black', 'white'])

export function describe(family, lch) {
  return NEUTRAL.has(family) ? neutralDescription(family, lch) : chromaticDescription(family, lch)
}

// ── Color-vision heads-up ───────────────────────────────────────────────────

const simCache = new Map()
function simulatedPalette(profile, severity) {
  const key = `${profile}:${severity}`
  if (!simCache.has(key)) {
    simCache.set(
      key,
      PALETTE.map((e) => {
        const rgb = hexToRgbTriplet(e.hex)
        const s = simulateRgb(rgb, profile, severity)
        return { entry: e, lab: rgbToOklab(s.r, s.g, s.b) }
      }),
    )
  }
  return simCache.get(key)
}

function hexToRgbTriplet(hex) {
  const n = parseInt(hex.slice(1), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

const CONFUSABLE_PROFILES = new Set(['protanopia', 'deuteranopia', 'tritanopia'])
// How close (ΔE_OK) two colors must look *to that viewer* to count as confusable.
const CONFUSE_AT = 0.03

const listJoin = (xs) => (xs.length < 2 ? xs[0] : `${xs.slice(0, -1).join(', ')} or ${xs.at(-1)}`)

export function confusionFor({ r, g, b }, family, profile, severity = 1) {
  if (!CONFUSABLE_PROFILES.has(profile)) return null
  if (NEUTRAL.has(family)) return null
  const s = simulateRgb({ r, g, b }, profile, severity)
  const seen = rgbToOklab(s.r, s.g, s.b)
  const hits = new Map()
  for (const { entry, lab } of simulatedPalette(profile, severity)) {
    if (entry.family === family) continue
    const d = Math.hypot(seen.L - lab.L, seen.a - lab.a, seen.b - lab.b)
    if (d < CONFUSE_AT && (!hits.has(entry.family) || hits.get(entry.family) > d)) {
      hits.set(entry.family, d)
    }
  }
  if (!hits.size) return null
  const families = [...hits.entries()].sort((x, y) => x[1] - y[1]).slice(0, 2).map(([f]) => f)
  return {
    looksLike: families,
    text: `With ${CVD_SHORT[profile].toLowerCase()} color vision, this ${family} can look like ${listJoin(families)}.`,
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

// A live camera hovers on name boundaries; keeping the current name until
// another is clearly better stops "Teal, Turquoise, Teal..." flicker.
const STICKY_MARGIN = 0.012

export function identify(
  r, g, b,
  { profile = 'none', severity = 1, stickTo = null, stickMargin = STICKY_MARGIN } = {},
) {
  const lab = rgbToOklab(r, g, b)
  const lch = oklabToOklch(lab)
  const ranked = rankNames(lab, 12)
  let first = ranked[0]
  if (stickTo && first.entry.name !== stickTo) {
    const held = ranked.find((x) => x.entry.name === stickTo)
    if (held && held.d <= first.d + stickMargin) first = held
  }
  const second = ranked.find((x) => x !== first)
  const best = first.entry
  const family = best.family

  // The closest name from a *different* family, when it's nearly as good.
  // This is the honest answer for colors that sit on a boundary.
  const rival = ranked.find((x) => x.entry.family !== family)
  const alsoCalled = rival && rival.d < first.d * 1.18 + 0.008 ? rival.entry.name : null

  const confusion = confusionFor({ r, g, b }, family, profile, severity)
  const hsl = rgbToHslString(r, g, b)

  return {
    r, g, b,
    hex: toHex(r, g, b),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl,
    name: best.name,
    family: FAMILIES[family],
    familyKey: family,
    description: describe(family, lch),
    like: best.like,
    alsoCalled,
    match: first.d < 0.03 ? 'exact' : first.d < 0.065 ? 'close' : 'approx',
    runnerUp: second?.entry.name ?? null,
    confusion: confusion?.text ?? null,
    looksLike: confusion?.looksLike ?? [],
    // Back-compat with saved history + older components.
    descriptive: describe(family, lch),
    reference: best.like,
  }
}

function rgbToHslString(r, g, b) {
  const R = r / 255, G = g / 255, B = b / 255
  const max = Math.max(R, G, B), min = Math.min(R, G, B)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === R) h = ((G - B) / d + (G < B ? 6 : 0)) / 6
    else if (max === G) h = ((B - R) / d + 2) / 6
    else h = ((R - G) / d + 4) / 6
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

/** A sentence for text-to-speech or sharing. */
export function spokenSummary(c) {
  const parts = [`${c.name}.`, `${c.description}.`]
  if (c.like) parts.push(`${c.like.charAt(0).toUpperCase()}${c.like.slice(1)}.`)
  return parts.join(' ')
}
