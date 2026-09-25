// Comparing two colors, including "would these look the same to me?"
import { rgbToLab, ciede2000, contrastRatio } from './colorMath'
import { simulateRgb } from './cvd'

const TYPES = ['protanopia', 'deuteranopia', 'tritanopia']
// ΔE2000 under which two real-world surfaces are easy to mix up. (~2.3 is the
// lab "just noticeable" difference; in a store aisle it takes a lot more.)
const LOOKALIKE = 7

const lab = (c) => rgbToLab(c.r, c.g, c.b)
const de = (a, b) => ciede2000(lab(a), lab(b))

export function differenceLabel(d) {
  if (d < 1) return 'Identical'
  if (d < 2.5) return 'Nearly identical'
  if (d < 5) return 'Very similar'
  if (d < 12) return 'Noticeably different'
  if (d < 30) return 'Clearly different'
  return 'Completely different'
}

export function contrastRating(ratio) {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA large text only'
  return 'Fails'
}

export function compareColors(a, b, { profile = 'none', severity = 1 } = {}) {
  const deltaE = de(a, b)
  const seenBy = (type) => de(simulateRgb(a, type, severity), simulateRgb(b, type, severity))

  // Types for which two visibly different colors collapse into look-alikes.
  const lookAlikeFor = deltaE >= LOOKALIKE
    ? TYPES.filter((t) => seenBy(t) < LOOKALIKE)
    : []

  let forYou = null
  if (TYPES.includes(profile)) {
    const d = seenBy(profile)
    forYou = { deltaE: d, likelyConfused: d < LOOKALIKE }
  } else if (profile === 'achromatopsia') {
    const d = de(simulateRgb(a, profile), simulateRgb(b, profile))
    forYou = { deltaE: d, likelyConfused: d < LOOKALIKE }
  }

  const ratio = contrastRatio(a, b)
  return {
    deltaE,
    label: differenceLabel(deltaE),
    same: deltaE < 2.5,
    lookAlikeFor,
    forYou,
    contrast: { ratio, rating: contrastRating(ratio) },
  }
}
