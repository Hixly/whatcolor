import { identify } from '../identify'
import { parseHex, rgbToLab, ciede2000, contrastRatio, rgbToOklab, oklabToRgb } from '../colorMath'
import { simulateRgb } from '../cvd'
import { PALETTE } from '../palette'

const id = (hex, opts) => {
  const { r, g, b } = parseHex(hex)
  return identify(r, g, b, opts)
}

describe('everyday names', () => {
  it.each([
    ['#3b5b84', 'Denim'],
    ['#1c2541', 'Navy'],
    ['#c3b091', 'Khaki'],
    ['#9caf88', 'Sage'],
    ['#6e1a2a', 'Maroon'],
    ['#d9c7a7', 'Beige'],
    ['#0f8a8c', 'Teal'],
    ['#c4673f', 'Terracotta'],
    ['#f3ead3', 'Cream'],
    ['#f7f7f5', 'White'],
    ['#16161a', 'Black'],
    ['#36393d', 'Charcoal'],
    ['#8b5a2b', 'Brown'],
    ['#c08a8c', 'Dusty Rose'],
    ['#a44a22', 'Rust'],
  ])('%s is %s', (hex, name) => {
    expect(id(hex).name).toBe(name)
  })

  it('never uses developer/CSS-only names', () => {
    const banned = /papaya|gainsboro|blanched|moccasin|burlywood|peru|cornsilk|seashell|thistle|chiffon|aliceblue|medium|dodger|lawn/i
    for (const e of PALETTE) expect(e.name).not.toMatch(banned)
  })
})

describe('families', () => {
  it.each([
    ['#ff0000', 'Red'], ['#00ff00', 'Green'], ['#0000ff', 'Blue'], ['#ffff00', 'Yellow'],
    ['#ff8c1a', 'Orange'], ['#6c2a8c', 'Purple'], ['#ff3f9e', 'Pink'], ['#6f4e37', 'Brown'],
    ['#808080', 'Gray'], ['#000000', 'Black'], ['#ffffff', 'White'], ['#1ad6e6', 'Teal'],
  ])('%s is in the %s family', (hex, family) => {
    expect(id(hex).family).toBe(family)
  })
})

describe('plain-language descriptions', () => {
  it('reads dark saturated reds as deep, not vivid', () => {
    expect(id('#6e1a2a').description).toBe('Deep red')
  })
  it('reads pastels as soft', () => {
    expect(id('#ffc8a2').description).toBe('Light, soft orange')
  })
  it('does not call pure yellow light', () => {
    expect(id('#ffff00').description).toBe('Bright yellow')
  })
  it('describes the lean between hues', () => {
    expect(id('#b5cc35').description).toMatch(/yellowish green/)
  })
  it('describes tinted grays', () => {
    expect(id('#6f8393').description).toBe('Medium gray with a blue tint')
  })
  it('contains no em dashes anywhere in user-facing words', () => {
    for (const hex of ['#3b5b84', '#ff0000', '#808080', '#f3ead3', '#6e1a2a']) {
      const c = id(hex, { profile: 'deuteranopia' })
      for (const s of [c.name, c.description, c.like, c.confusion]) {
        if (s) expect(s).not.toMatch(/—|--/)
      }
    }
  })
})

describe('color-vision heads-up', () => {
  it('is off without a profile', () => {
    expect(id('#228b22').confusion).toBeNull()
  })
  it('warns a deutan that a green can pass for red or orange', () => {
    const c = id('#228b22', { profile: 'deuteranopia' })
    expect(c.confusion).toMatch(/green can look like/)
    expect(c.looksLike.some((f) => ['red', 'orange', 'brown'].includes(f))).toBe(true)
  })
  it('never warns on neutrals', () => {
    expect(id('#808080', { profile: 'protanopia' }).confusion).toBeNull()
  })
})

describe('simulation', () => {
  it('achromatopsia removes all color', () => {
    const s = simulateRgb({ r: 255, g: 0, b: 0 }, 'achromatopsia')
    expect(s.r).toBe(s.g)
    expect(s.g).toBe(s.b)
  })
  it('protanopia collapses red and green toward the same yellowish axis', () => {
    const red = simulateRgb({ r: 200, g: 40, b: 40 }, 'protanopia')
    const green = simulateRgb({ r: 90, g: 110, b: 40 }, 'protanopia')
    const d = Math.hypot(red.r - green.r, red.g - green.g, red.b - green.b)
    expect(d).toBeLessThan(60)
  })
  it('leaves colors alone for typical vision', () => {
    expect(simulateRgb({ r: 12, g: 200, b: 99 }, 'none')).toEqual({ r: 12, g: 200, b: 99 })
  })
})

describe('color math', () => {
  it('matches the CIEDE2000 reference data (Sharma et al. 2005)', () => {
    expect(ciede2000({ L: 50, a: 2.6772, b: -79.7751 }, { L: 50, a: 0, b: -82.7485 })).toBeCloseTo(2.0425, 3)
    expect(ciede2000({ L: 50, a: -1.3802, b: -84.2814 }, { L: 50, a: 0, b: -82.7485 })).toBeCloseTo(1.0, 3)
    expect(ciede2000({ L: 50, a: 2.5, b: 0 }, { L: 73, a: 25, b: -18 })).toBeCloseTo(27.1492, 3)
  })
  it('computes WCAG contrast', () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 5)
  })
  it('round-trips sRGB through OKLab', () => {
    const lab = rgbToOklab(123, 45, 210)
    expect(oklabToRgb(lab.L, lab.a, lab.b)).toEqual({ r: 123, g: 45, b: 210 })
  })
  it('puts white at L=100 in CIELAB', () => {
    expect(rgbToLab(255, 255, 255).L).toBeCloseTo(100, 3)
  })
})
