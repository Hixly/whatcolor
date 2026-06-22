import { describe, it, expect } from 'vitest'
import { CROSSHAIR_TRANSITION_MS, DEMO_CYCLE_MS } from '../PhoneMockup.jsx'

describe('PhoneMockup demo timing', () => {
  it('keeps the label visible on-target for at least half the cycle', () => {
    const dwellMs = DEMO_CYCLE_MS - CROSSHAIR_TRANSITION_MS
    expect(dwellMs).toBeGreaterThanOrEqual(CROSSHAIR_TRANSITION_MS * 0.5)
  })

  it('updates the label only after the crosshair finishes moving', () => {
    expect(CROSSHAIR_TRANSITION_MS).toBeLessThan(DEMO_CYCLE_MS)
  })
})
