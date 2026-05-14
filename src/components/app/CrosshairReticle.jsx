function hueToHex(hue) {
  const h = hue / 60
  const s = 1, l = 0.5
  const a = s * Math.min(l, 1 - l)
  const f = n => {
    const k = (n + h) % 12
    return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
  }
  const toHex = v => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function donutSlice(cx, cy, outerR, innerR, startDeg, endDeg) {
  const o1 = polarToCartesian(cx, cy, outerR, startDeg)
  const o2 = polarToCartesian(cx, cy, outerR, endDeg)
  const i1 = polarToCartesian(cx, cy, innerR, endDeg)
  const i2 = polarToCartesian(cx, cy, innerR, startDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ')
}

const SEGMENTS = 48

export default function CrosshairReticle({ size = 80, lineColor = '#111111' }) {
  const cx = size / 2
  const cy = size / 2
  // Thicker ring matching logo proportions
  const outerR = size * 0.455
  const innerR = size * 0.255
  // Bold lines and dot matching logo
  const lineThick = Math.max(2, size * 0.065)
  const dotR = Math.max(3, size * 0.105)
  // Lines extend slightly past outer ring
  const lineExtent = size * 0.02

  const slices = Array.from({ length: SEGMENTS }, (_, i) => {
    const start = i * (360 / SEGMENTS)
    const end = start + (360 / SEGMENTS) + 0.3
    const hue = i * (360 / SEGMENTS)
    return { path: donutSlice(cx, cy, outerR, innerR, start, end), color: hueToHex(hue) }
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
      aria-label="Color detection crosshair"
      role="img"
    >
      {/* Rainbow ring — drawn first (bottom layer) */}
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} />
      ))}

      {/* Crosshair lines — ON TOP of the ring, dividing it into quadrants */}
      <line x1={cx} y1={lineExtent} x2={cx} y2={size - lineExtent} stroke={lineColor} strokeWidth={lineThick} strokeLinecap="round" />
      <line x1={lineExtent} y1={cy} x2={size - lineExtent} y2={cy} stroke={lineColor} strokeWidth={lineThick} strokeLinecap="round" />

      {/* Center sampling dot — topmost */}
      <circle cx={cx} cy={cy} r={dotR} fill={lineColor} />
    </svg>
  )
}
