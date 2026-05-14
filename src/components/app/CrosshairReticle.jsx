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

// 6 distinct rainbow segments matching the logo color wheel
const SEGMENTS = [
  { start: 0,   end: 60,  color: '#FF3B30' }, // red
  { start: 60,  end: 120, color: '#FF9500' }, // orange-yellow
  { start: 120, end: 180, color: '#FFD60A' }, // yellow
  { start: 180, end: 240, color: '#30D158' }, // green
  { start: 240, end: 300, color: '#0A84FF' }, // blue
  { start: 300, end: 360, color: '#BF5AF2' }, // purple
]

export default function CrosshairReticle({ size = 80, lineColor = '#111111' }) {
  const cx = size / 2
  const cy = size / 2
  const outerR = size * 0.455
  const innerR = size * 0.255
  const lineThick = Math.max(2, size * 0.065)
  const dotR = Math.max(3, size * 0.105)
  const lineExtent = size * 0.02

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="drop-shadow-[0_2px_12px_rgba(0,0,0,0.18)]"
      aria-label="Color detection crosshair"
      role="img"
    >
      {/* Rainbow ring — 6 distinct segments, drawn first (bottom layer) */}
      {SEGMENTS.map((s, i) => (
        <path key={i} d={donutSlice(cx, cy, outerR, innerR, s.start, s.end)} fill={s.color} />
      ))}

      {/* Crosshair lines — ON TOP of the ring */}
      <line x1={cx} y1={lineExtent} x2={cx} y2={size - lineExtent} stroke={lineColor} strokeWidth={lineThick} strokeLinecap="round" />
      <line x1={lineExtent} y1={cy} x2={size - lineExtent} y2={cy} stroke={lineColor} strokeWidth={lineThick} strokeLinecap="round" />

      {/* Center sampling dot — topmost */}
      <circle cx={cx} cy={cy} r={dotR} fill={lineColor} />
    </svg>
  )
}
