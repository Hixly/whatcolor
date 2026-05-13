import { useState } from 'react'
import { hexToRgb } from '../../utils/colorConversions'
import { deltaE76, colorDifferenceLabel, wouldConfuse } from '../../utils/deltaE'
import { nearestColorName } from '../../utils/colorNames'
import Button from '../ui/Button'

function contrastRatio(r1, g1, b1, r2, g2, b2) {
  function lum(r, g, b) {
    const [rv, gv, bv] = [r, g, b].map(v => {
      v /= 255
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rv + 0.7152 * gv + 0.0722 * bv
  }
  const l1 = lum(r1, g1, b1), l2 = lum(r2, g2, b2)
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2)
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2)
}

function ColorSlot({ label, color, onSet, onCapture, history }) {
  const [hexInput, setHexInput] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  function submitHex() {
    const clean = hexInput.trim()
    const withHash = clean.startsWith('#') ? clean : '#' + clean
    const rgb = hexToRgb(withHash)
    if (!rgb) return
    const name = nearestColorName(rgb.r, rgb.g, rgb.b)
    onSet({ ...rgb, hex: withHash, name })
    setHexInput('')
  }

  return (
    <div className="flex flex-col gap-3 flex-1 min-w-0">
      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{label}</p>
      {color ? (
        <div className="flex flex-col gap-2">
          <div className="h-32 rounded-2xl border border-dark-border" style={{ backgroundColor: color.hex }} />
          <p className="font-bold text-white text-lg truncate">{color.name}</p>
          <p className="font-mono text-sm text-gray-400">{color.hex}</p>
          <button onClick={() => onSet(null)} className="text-xs text-gray-600 hover:text-gray-400 transition-colors text-left">Clear</button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="h-32 rounded-2xl border-2 border-dashed border-dark-border flex items-center justify-center text-gray-600 text-sm">
            No color selected
          </div>
          <Button variant="secondary" size="sm" onClick={onCapture}>📷 Capture from camera</Button>
          <button
            onClick={() => setShowHistory(v => !v)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors text-left"
          >
            {showHistory ? 'Hide history' : 'Pick from history'}
          </button>
          {showHistory && history.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {history.map(h => (
                <button
                  key={h.id}
                  onClick={() => onSet(h)}
                  className="w-8 h-8 rounded-lg border border-dark-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: h.hex }}
                  title={h.name}
                />
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
              placeholder="#HEX"
              value={hexInput}
              onChange={e => setHexInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitHex()}
            />
            <Button variant="secondary" size="sm" onClick={submitHex}>Set</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CompareMode({ currentColor, history, onBack }) {
  const [colorA, setColorA] = useState(null)
  const [colorB, setColorB] = useState(null)

  function captureFromCamera(slot) {
    if (!currentColor) return
    if (slot === 'A') setColorA(currentColor)
    else setColorB(currentColor)
  }

  const bothReady = colorA && colorB
  let de, diffLabel, confused, contrast

  if (bothReady) {
    de = deltaE76(colorA.r, colorA.g, colorA.b, colorB.r, colorB.g, colorB.b)
    diffLabel = colorDifferenceLabel(de)
    confused = wouldConfuse(de)
    contrast = contrastRatio(colorA.r, colorA.g, colorA.b, colorB.r, colorB.g, colorB.b)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border shrink-0">
        <h2 className="font-bold text-white text-lg">Compare Colors</h2>
        <button onClick={onBack} className="text-gray-500 hover:text-white text-sm transition-colors">← Back</button>
      </div>

      <div className="flex gap-5 p-5">
        <ColorSlot label="Color A" color={colorA} onSet={setColorA} onCapture={() => captureFromCamera('A')} history={history} />
        <div className="w-px bg-dark-border self-stretch" />
        <ColorSlot label="Color B" color={colorB} onSet={setColorB} onCapture={() => captureFromCamera('B')} history={history} />
      </div>

      {bothReady && (
        <div className="px-5 pb-5 flex flex-col gap-3">
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Are these the same?</span>
              <span className={`font-bold text-lg ${de < 2 ? 'text-green-400' : 'text-red-400'}`}>
                {de < 2 ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">How different?</span>
              <span className="text-white font-semibold text-sm">{diffLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Would I confuse these?</span>
              <span className={`font-bold text-sm ${confused ? 'text-yellow-400' : 'text-green-400'}`}>
                {confused ? 'Possibly yes' : 'Probably not'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Contrast ratio (WCAG)</span>
              <span className="font-mono text-white text-sm">
                {contrast}:1{' '}
                {Number(contrast) >= 4.5
                  ? '✅ AA pass'
                  : Number(contrast) >= 3
                  ? '⚠️ AA large text'
                  : '❌ Fail'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
