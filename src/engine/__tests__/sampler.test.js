import { robustAverage, gainsFromReference, screenToSource } from '../sampler'

const pixels = (list) => new Uint8ClampedArray(list.flatMap(([r, g, b]) => [r, g, b, 255]))

describe('robustAverage', () => {
  it('ignores a specular glint and a shadow', () => {
    const base = Array.from({ length: 18 }, () => [40, 110, 60])
    const data = pixels([...base, [255, 255, 255], [255, 255, 250], [2, 2, 2], [0, 0, 0]])
    const { r, g, b } = robustAverage(data)
    expect([r, g, b]).toEqual([40, 110, 60])
  })

  it('averages in linear light, not gamma', () => {
    // Half black, half white averages to ~188 in sRGB, not 128.
    const data = pixels([...Array(10).fill([0, 0, 0]), ...Array(10).fill([255, 255, 255])])
    const { r } = robustAverage(data)
    expect(r).toBeGreaterThan(180)
  })

  it('turns a warm-lit white reference into white', () => {
    const data = pixels(Array(16).fill([200, 180, 140]))
    const ref = robustAverage(data)
    const { gains } = gainsFromReference(ref.linear)
    const fixed = robustAverage(data, gains)
    expect(Math.abs(fixed.r - fixed.b)).toBeLessThanOrEqual(1)
    expect(Math.abs(fixed.r - fixed.g)).toBeLessThanOrEqual(1)
    expect(fixed.r).toBeGreaterThan(235)
  })

  it('does not over-brighten a dim reference', () => {
    const { gains } = gainsFromReference({ r: 0.1, g: 0.1, b: 0.1 })
    expect(gains.g).toBeCloseTo(2.5, 5)
  })
})

describe('gainsFromReference', () => {
  it('refuses a dark reference', () => {
    expect(gainsFromReference({ r: 0.01, g: 0.01, b: 0.01 }).error).toBe('too-dark')
  })
  it('refuses a strongly colored reference', () => {
    expect(gainsFromReference({ r: 0.8, g: 0.1, b: 0.1 }).error).toBe('too-colorful')
  })
})

describe('screenToSource', () => {
  it('maps the center of a cover-fit box to the center of the source', () => {
    const p = screenToSource(200, 400, { width: 400, height: 800 }, { width: 1920, height: 1080 }, 'cover')
    expect(p.x).toBeCloseTo(960)
    expect(p.y).toBeCloseTo(540)
  })
  it('accounts for cropping when the crosshair is off-center', () => {
    // 400x800 portrait box showing a 1920x1080 landscape frame: scale = 800/1080
    const p = screenToSource(200, 352, { width: 400, height: 800 }, { width: 1920, height: 1080 }, 'cover')
    expect(p.y).toBeCloseTo(540 - 48 / (800 / 1080))
  })
  it('flags taps outside a letterboxed photo', () => {
    const p = screenToSource(200, 20, { width: 400, height: 800 }, { width: 1000, height: 1000 }, 'contain')
    expect(p.inside).toBe(false)
  })
})
