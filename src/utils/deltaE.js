function rgbToXyz(r, g, b) {
  let rv = r / 255, gv = g / 255, bv = b / 255
  rv = rv > 0.04045 ? Math.pow((rv + 0.055) / 1.055, 2.4) : rv / 12.92
  gv = gv > 0.04045 ? Math.pow((gv + 0.055) / 1.055, 2.4) : gv / 12.92
  bv = bv > 0.04045 ? Math.pow((bv + 0.055) / 1.055, 2.4) : bv / 12.92
  return {
    x: rv * 0.4124 + gv * 0.3576 + bv * 0.1805,
    y: rv * 0.2126 + gv * 0.7152 + bv * 0.0722,
    z: rv * 0.0193 + gv * 0.1192 + bv * 0.9505,
  }
}

function xyzToLab({ x, y, z }) {
  const f = v => v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116
  const fx = f(x / 0.95047), fy = f(y / 1.00000), fz = f(z / 1.08883)
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) }
}

function rgbToLab(r, g, b) {
  return xyzToLab(rgbToXyz(r, g, b))
}

export function deltaE76(r1, g1, b1, r2, g2, b2) {
  const lab1 = rgbToLab(r1, g1, b1)
  const lab2 = rgbToLab(r2, g2, b2)
  return Math.sqrt(
    Math.pow(lab1.L - lab2.L, 2) +
    Math.pow(lab1.a - lab2.a, 2) +
    Math.pow(lab1.b - lab2.b, 2)
  )
}

export function colorDifferenceLabel(de) {
  if (de < 2) return 'Nearly identical'
  if (de < 10) return 'Very similar'
  if (de < 25) return 'Noticeably different'
  if (de < 50) return 'Very different'
  return 'Completely different'
}

export function wouldConfuse(de) {
  return de < 15
}
