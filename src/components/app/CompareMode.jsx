import { useState } from 'react'
import { hexToRgb } from '../../utils/colorConversions'
import { deltaE76, colorDifferenceLabel, wouldConfuse } from '../../utils/deltaE'
import { nearestColorName } from '../../utils/colorNames'
import { ArrowLeftIcon, CameraIcon, CheckIcon, XIcon } from '../ui/Icons'

function contrastRatio(r1, g1, b1, r2, g2, b2) {
  function lum(r, g, b) {
    const [rv, gv, bv] = [r, g, b].map(v => {
      v /= 255
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rv + 0.7152 * gv + 0.0722 * bv
  }
  const l1 = lum(r1, g1, b1), l2 = lum(r2, g2, b2)
  return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2)
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
      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{label}</p>
      {color ? (
        <div className="flex flex-col gap-2">
          <div className="h-28 rounded-2xl border border-white/10" style={{ backgroundColor: color.hex }} />
          <p className="font-bold text-white truncate">{color.name}</p>
          <p className="font-mono text-xs text-white/40">{color.hex}</p>
          <button onClick={() => onSet(null)} className="text-xs text-white/20 hover:text-white/50 transition-colors text-left">Clear</button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="h-28 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-white/20 text-xs">
            No color selected
          </div>
          <button
            onClick={onCapture}
            className="flex items-center justify-center gap-2 py-2 rounded-full bg-white/10 text-white/70 text-xs font-semibold hover:bg-white/15 transition-all"
          >
            <CameraIcon size={13} /> Capture from camera
          </button>
          <button
            onClick={() => setShowHistory(v => !v)}
            className="text-xs text-white/30 hover:text-white/60 transition-colors text-left"
          >
            {showHistory ? 'Hide history' : 'Pick from history'}
          </button>
          {showHistory && history.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
              {history.map(h => (
                <button key={h.id} onClick={() => onSet(h)} className="w-7 h-7 rounded-lg border border-white/10 hover:scale-110 transition-transform" style={{ backgroundColor: h.hex }} title={h.name} />
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-2 text-xs font-mono text-white placeholder-white/20 focus:outline-none focus:border-white/30"
              placeholder="#HEX"
              value={hexInput}
              onChange={e => setHexInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitHex()}
            />
            <button onClick={submitHex} className="px-4 py-2 bg-white/10 text-white/70 text-xs font-semibold rounded-full hover:bg-white/20 transition-all">Set</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/40 font-light">{label}</span>
      <span className={`text-sm font-semibold ${highlight || 'text-white'}`}>{value}</span>
    </div>
  )
}

export default function CompareMode({ currentColor, history, onBack }) {
  const [colorA, setColorA] = useState(null)
  const [colorB, setColorB] = useState(null)

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
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] shrink-0">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
          <ArrowLeftIcon size={15} className="text-white/60" />
        </button>
        <h2 className="font-bold text-white">Compare Colors</h2>
      </div>

      <div className="flex gap-4 p-5">
        <ColorSlot label="Color A" color={colorA} onSet={setColorA} onCapture={() => colorA === null && currentColor && setColorA(currentColor)} history={history} />
        <div className="w-px bg-white/[0.06] self-stretch" />
        <ColorSlot label="Color B" color={colorB} onSet={setColorB} onCapture={() => colorB === null && currentColor && setColorB(currentColor)} history={history} />
      </div>

      {bothReady && (
        <div className="px-5 pb-5">
          <div className="bg-white/5 border border-white/[0.06] rounded-2xl px-4 py-2">
            <Metric
              label="Same color?"
              value={de < 2 ? 'Yes' : 'No'}
              highlight={de < 2 ? 'text-brand-green' : 'text-brand-red'}
            />
            <Metric label="Difference" value={diffLabel} />
            <Metric
              label="Would I confuse these?"
              value={confused ? 'Possibly' : 'Probably not'}
              highlight={confused ? 'text-yellow-400' : 'text-brand-green'}
            />
            <Metric
              label="WCAG contrast"
              value={`${contrast}:1 · ${Number(contrast) >= 4.5 ? 'AA pass' : Number(contrast) >= 3 ? 'AA large' : 'Fail'}`}
              highlight={Number(contrast) >= 4.5 ? 'text-brand-green' : Number(contrast) >= 3 ? 'text-yellow-400' : 'text-brand-red'}
            />
          </div>
        </div>
      )}
    </div>
  )
}
