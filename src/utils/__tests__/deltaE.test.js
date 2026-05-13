import { describe, it, expect } from 'vitest'
import { deltaE76, colorDifferenceLabel } from '../deltaE'

describe('deltaE76', () => {
  it('returns 0 for identical colors', () => {
    expect(deltaE76(255, 0, 0, 255, 0, 0)).toBe(0)
  })
  it('returns large value for black vs white', () => {
    expect(deltaE76(0, 0, 0, 255, 255, 255)).toBeGreaterThan(80)
  })
  it('returns small value for similar colors', () => {
    expect(deltaE76(200, 50, 50, 205, 55, 55)).toBeLessThan(10)
  })
})

describe('colorDifferenceLabel', () => {
  it('labels near-identical', () => expect(colorDifferenceLabel(1)).toBe('Nearly identical'))
  it('labels very similar', () => expect(colorDifferenceLabel(5)).toBe('Very similar'))
  it('labels noticeably different', () => expect(colorDifferenceLabel(15)).toBe('Noticeably different'))
  it('labels very different', () => expect(colorDifferenceLabel(35)).toBe('Very different'))
  it('labels completely different', () => expect(colorDifferenceLabel(60)).toBe('Completely different'))
})
