import { compareColors } from '../compare'

const red = { r: 190, g: 50, b: 40 }
// Protans see red darker, so red collapses onto a darker olive; deutans onto a
// lighter one. Both pairs look completely different to typical eyes.
const deutanOlive = { r: 110, g: 120, b: 40 }
const protanOlive = { r: 95, g: 90, b: 40 }
const blue = { r: 30, g: 80, b: 200 }

describe('compareColors', () => {
  it('calls identical colors the same', () => {
    const out = compareColors(red, { ...red })
    expect(out.same).toBe(true)
    expect(out.label).toBe('Identical')
  })

  it('flags red/olive pairs as look-alikes for red-green color vision only', () => {
    const d = compareColors(red, deutanOlive)
    expect(d.same).toBe(false)
    expect(d.lookAlikeFor).toContain('deuteranopia')
    expect(d.lookAlikeFor).not.toContain('tritanopia')
    const p = compareColors(red, protanOlive)
    expect(p.lookAlikeFor).toContain('protanopia')
    expect(p.lookAlikeFor).not.toContain('tritanopia')
  })

  it('answers for the user when a profile is set', () => {
    expect(compareColors(red, deutanOlive, { profile: 'deuteranopia' }).forYou.likelyConfused).toBe(true)
    expect(compareColors(red, blue, { profile: 'deuteranopia' }).forYou.likelyConfused).toBe(false)
    expect(compareColors(red, deutanOlive).forYou).toBeNull()
  })

  it('rates contrast like WCAG', () => {
    expect(compareColors({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }).contrast.rating).toBe('AAA')
    expect(compareColors({ r: 118, g: 118, b: 118 }, { r: 255, g: 255, b: 255 }).contrast.rating).toBe('AA')
    // #777 on white is the classic near-miss: 4.48:1
    expect(compareColors({ r: 119, g: 119, b: 119 }, { r: 255, g: 255, b: 255 }).contrast.rating).toBe('AA large text only')
  })
})
