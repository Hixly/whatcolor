// Real-world colors used across the landing page demos. Every name shown on
// the page is computed by the same engine the app uses, never typed by hand.
import { identify } from '../../engine/identify'
import { parseHex } from '../../engine/colorMath'

const read = (hex, opts) => {
  const { r, g, b } = parseHex(hex)
  return identify(r, g, b, opts)
}

// Ordered for the swatch wall (6 columns). Red/green look-alikes sit next to
// each other on purpose, so the color-vision toggle makes the problem obvious.
export const WALL = [
  { thing: 'hoodie', hex: '#6e1a2a' },
  { thing: 'jacket', hex: '#5b5b2e' },
  { thing: 'jeans', hex: '#3b5b84' },
  { thing: 'pants', hex: '#c3b091' },
  { thing: 'mug', hex: '#0f8a8c' },
  { thing: 'scarf', hex: '#e1ad01' },
  { thing: 'brick', hex: '#9c4a3a' },
  { thing: 'leaf', hex: '#2e6b30' },
  { thing: 'suit', hex: '#1c2541' },
  { thing: 'couch', hex: '#d9c7a7' },
  { thing: 'pot', hex: '#c4673f' },
  { thing: 'sky', hex: '#87bde8' },
  { thing: 'sweater', hex: '#c08a8c' },
  { thing: 'plant', hex: '#9caf88' },
  { thing: 'soap', hex: '#c3a6e6' },
  { thing: 'wall', hex: '#a6e3c4' },
  { thing: 'bike', hex: '#a44a22' },
  { thing: 'tee', hex: '#36393d' },
  { thing: 'plum', hex: '#5e2350' },
  { thing: 'lime', hex: '#8fd13a' },
  { thing: 'top', hex: '#ff7a61' },
  { thing: 'ring', hex: '#caa24a' },
  { thing: 'mug', hex: '#f3ead3' },
  { thing: 'sneaker', hex: '#ff3f9e' },
].map((c) => ({ ...c, rgb: parseHex(c.hex), result: read(c.hex) }))

// The auto-tour through the wall, by index. Starts on the red/green trap.
export const TOUR = [0, 1, 2, 3, 12, 13, 14, 8, 5, 4]

export const HERO_CYCLE = [
  { thing: 'blue jeans', hex: '#3b5b84' },
  { thing: 'maroon hoodie', hex: '#6e1a2a' },
  { thing: 'army jacket', hex: '#5b5b2e' },
  { thing: 'khaki pants', hex: '#c3b091' },
  { thing: 'teal mug', hex: '#0f8a8c' },
  { thing: 'dusty pink sweater', hex: '#c08a8c' },
].map((c) => ({ ...c, result: read(c.hex) }))

// What the first engine said for these exact colors (recorded from the old
// code before it was replaced). The "now" side is computed live.
export const BEFORE_AFTER = [
  { thing: 'Maroon hoodie', hex: '#6e1a2a', before: 'Taupe' },
  { thing: 'Navy suit', hex: '#1c2541', before: 'Charcoal' },
  { thing: 'Khaki pants', hex: '#c3b091', before: 'Sage' },
  { thing: 'Lavender soap', hex: '#c3a6e6', before: 'Plum' },
  { thing: 'Mint wall', hex: '#a6e3c4', before: 'PowderBlue' },
  { thing: 'Mustard scarf', hex: '#e1ad01', before: 'Orange' },
].map((c) => ({ ...c, now: read(c.hex) }))

export { read as readHex }
