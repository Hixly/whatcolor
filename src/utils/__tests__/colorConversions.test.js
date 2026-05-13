import { describe, it, expect } from 'vitest'
import { rgbToHex, hexToRgb, rgbToHsl, hslToRgb } from '../colorConversions'

describe('rgbToHex', () => {
  it('converts pure red', () => expect(rgbToHex(255, 0, 0)).toBe('#ff0000'))
  it('converts pure white', () => expect(rgbToHex(255, 255, 255)).toBe('#ffffff'))
  it('converts pure black', () => expect(rgbToHex(0, 0, 0)).toBe('#000000'))
  it('converts mixed color', () => expect(rgbToHex(45, 95, 58)).toBe('#2d5f3a'))
})

describe('hexToRgb', () => {
  it('parses 6-char hex', () => expect(hexToRgb('#2d5f3a')).toEqual({ r: 45, g: 95, b: 58 }))
  it('parses without hash', () => expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 }))
  it('returns null for invalid', () => expect(hexToRgb('zzz')).toBeNull())
})

describe('rgbToHsl', () => {
  it('converts red', () => {
    const { h, s, l } = rgbToHsl(255, 0, 0)
    expect(h).toBe(0)
    expect(s).toBe(100)
    expect(l).toBe(50)
  })
  it('converts white', () => {
    const { h, s, l } = rgbToHsl(255, 255, 255)
    expect(s).toBe(0)
    expect(l).toBe(100)
  })
  it('converts black', () => {
    const { h, s, l } = rgbToHsl(0, 0, 0)
    expect(s).toBe(0)
    expect(l).toBe(0)
  })
})
