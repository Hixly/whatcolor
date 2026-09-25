// Render the saved color history into a shareable PNG swatch sheet and trigger
// a download. Pure canvas, no dependencies.
export function exportPalettePng(history) {
  if (!history || history.length === 0) return

  const scale = 2 // retina-crisp
  const W = 760
  const PAD = 40
  const HEADER = 96
  const ROW = 84
  const H = HEADER + history.length * ROW + PAD

  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)

  // Background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // Header
  ctx.fillStyle = '#111111'
  ctx.font = '600 26px Outfit, system-ui, sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('WhatColor Palette', PAD, 52)
  ctx.fillStyle = '#9ca3af'
  ctx.font = '400 14px Outfit, system-ui, sans-serif'
  const dateStr = new Date().toLocaleDateString()
  ctx.fillText(`${history.length} color${history.length === 1 ? '' : 's'} · ${dateStr} · what-color.com`, PAD, 74)

  // Divider
  ctx.strokeStyle = '#ebebeb'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, HEADER - 8)
  ctx.lineTo(W - PAD, HEADER - 8)
  ctx.stroke()

  // Rows
  history.forEach((entry, i) => {
    const y = HEADER + i * ROW
    // Swatch
    const sw = 56
    roundRect(ctx, PAD, y + (ROW - sw) / 2, sw, sw, 12)
    ctx.fillStyle = entry.hex || '#000000'
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'
    ctx.lineWidth = 1
    ctx.stroke()

    const tx = PAD + sw + 22
    const midY = y + ROW / 2
    // Name
    ctx.fillStyle = '#111111'
    ctx.font = '600 18px Outfit, system-ui, sans-serif'
    ctx.fillText(entry.name || 'Color', tx, midY - 4)
    // Hex + label
    ctx.fillStyle = '#6b7280'
    ctx.font = '400 14px "DejaVu Sans Mono", monospace'
    const meta = entry.label ? `${entry.hex}   ·   ${entry.label}` : entry.hex
    ctx.fillText(meta, tx, midY + 18)

    // Row separator
    if (i < history.length - 1) {
      ctx.strokeStyle = '#f3f4f6'
      ctx.beginPath()
      ctx.moveTo(PAD, y + ROW)
      ctx.lineTo(W - PAD, y + ROW)
      ctx.stroke()
    }
  })

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'whatcolor-palette.png'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
