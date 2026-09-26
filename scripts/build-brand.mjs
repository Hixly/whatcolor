// Writes the WhatColor brand SVGs into public/ from src/brand/mark.js.
//   node scripts/build-brand.mjs
// The PNG icons (favicon-16/32, apple-touch-icon, icon-192/512, maskable,
// logo-*.png) are rasterized from these SVGs at the listed sizes.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { markSvg } from '../src/brand/mark.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = (name, svg) => {
  writeFileSync(path.join(root, 'public', name), svg + '\n')
  console.log('wrote public/' + name)
}

const gradientBg = (svg) =>
  svg.replace(
    '<rect',
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef0f3"/></linearGradient></defs><rect',
  )

// Browser tab: white tile so it reads on dark tab bars too.
out('favicon.svg', markSvg({ size: 32, background: '#ffffff', radius: 22, scale: 0.9 }))
// Plain marks for anywhere else (docs, press, other sites).
out('logo-mark.svg', markSvg({ size: 512 }))
out('logo-mark-white.svg', markSvg({ size: 512, ink: '#ffffff' }))
// App icons: full-bleed tile (the OS applies its own corner mask).
out('icon.svg', gradientBg(markSvg({ size: 512, background: 'url(#bg)', radius: 0, scale: 0.74 })))
// Maskable: keep the mark inside the 80% safe zone.
out('icon-maskable.svg', gradientBg(markSvg({ size: 512, background: 'url(#bg)', radius: 0, scale: 0.6 })))
// Rounded tile for places that show the icon as-is (portfolio cards, READMEs).
out('icon-rounded.svg', gradientBg(markSvg({ size: 512, background: 'url(#bg)', radius: 22, scale: 0.78 })))
