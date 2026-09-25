// Color-vision-deficiency simulation (Machado, Oliveira & Fernandes, 2009).
//
// The matrices operate on *linear* RGB, which is what the model was fit on;
// applying them to gamma-encoded values (a common shortcut) skews the result.
// Severity 1.0 = dichromacy (protanopia / deuteranopia / tritanopia).
import { srgbToLinear, linearToSrgb } from './colorMath'

const MACHADO = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
}

export const CVD_TYPES = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia']

/**
 * Simulate how a color appears with a given color-vision type.
 * `severity` blends from normal vision (0) to full dichromacy (1), which is a
 * reasonable stand-in for the milder "-anomaly" forms most people actually have.
 */
export function simulateRgb({ r, g, b }, type, severity = 1) {
  if (!type || type === 'none' || type === 'custom') return { r, g, b }
  const R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b)

  if (type === 'achromatopsia') {
    const y = linearToSrgb(0.2126 * R + 0.7152 * G + 0.0722 * B)
    const mix = (c) => Math.round(c + (y - c) * severity)
    return { r: mix(r), g: mix(g), b: mix(b) }
  }

  const m = MACHADO[type]
  if (!m) return { r, g, b }
  const s = severity
  const out = [0, 1, 2].map((i) => {
    const v = m[i][0] * R + m[i][1] * G + m[i][2] * B
    const orig = [R, G, B][i]
    return linearToSrgb(orig + (v - orig) * s)
  })
  return { r: out[0], g: out[1], b: out[2] }
}

export const CVD_LABELS = {
  none: 'Typical color vision',
  protanopia: 'Protan (red-weak or red-blind)',
  deuteranopia: 'Deutan (green-weak or green-blind)',
  tritanopia: 'Tritan (blue-yellow)',
  achromatopsia: 'Achromatopsia (no color)',
}

export const CVD_SHORT = {
  protanopia: 'Protan',
  deuteranopia: 'Deutan',
  tritanopia: 'Tritan',
  achromatopsia: 'Mono',
}
