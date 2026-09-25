// Color-vision-deficiency simulation.
// Approximate sRGB transform matrices (HCIRN / classic dichromat model) — good
// enough for an at-a-glance "how others might see this color" preview, not a
// clinical tool. Each row maps source RGB to one output channel.
import { hexToRgb, rgbToHex } from './colorConversions'

const MATRICES = {
  protanopia: [
    [0.567, 0.433, 0.0],
    [0.558, 0.442, 0.0],
    [0.0, 0.242, 0.758],
  ],
  deuteranopia: [
    [0.625, 0.375, 0.0],
    [0.7, 0.3, 0.0],
    [0.0, 0.3, 0.7],
  ],
  tritanopia: [
    [0.95, 0.05, 0.0],
    [0.0, 0.433, 0.567],
    [0.0, 0.475, 0.525],
  ],
}

const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)))

// Returns the simulated hex for a given CVD type, or the original hex if unknown.
export function simulateCvd(hex, type) {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const { r, g, b } = rgb

  if (type === 'achromatopsia') {
    const y = clamp(0.299 * r + 0.587 * g + 0.114 * b)
    return rgbToHex(y, y, y)
  }

  const m = MATRICES[type]
  if (!m) return hex
  return rgbToHex(
    clamp(m[0][0] * r + m[0][1] * g + m[0][2] * b),
    clamp(m[1][0] * r + m[1][1] * g + m[1][2] * b),
    clamp(m[2][0] * r + m[2][1] * g + m[2][2] * b),
  )
}

// Types shown in the "how others see it" preview, with short labels.
export const CVD_PREVIEW_TYPES = [
  { type: 'protanopia', label: 'Protan' },
  { type: 'deuteranopia', label: 'Deutan' },
  { type: 'tritanopia', label: 'Tritan' },
  { type: 'achromatopsia', label: 'Gray' },
]
