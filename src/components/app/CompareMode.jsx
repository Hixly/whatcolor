import { useState, useMemo } from 'react'
import { useSettings } from '../../contexts/SettingsContext'
import { engineOptions } from '../../contexts/engineOptions'
import { identify } from '../../engine/identify'
import { parseHex } from '../../engine/colorMath'
import { compareColors } from '../../engine/compare'
import { CVD_SHORT } from '../../engine/cvd'
import { ArrowLeftIcon, CameraIcon, WarningIcon, CheckIcon } from '../ui/Icons'

// Anything coming in (live color, old history entry, typed hex) gets re-read
// by the current engine so both sides speak the same words.
const normalize = (c) => (c ? identify(c.r, c.g, c.b) : null)

function ColorSlot({ label, color, onSet, currentColor, history }) {
  const [hexInput, setHexInput] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [bad, setBad] = useState(false)

  function submitHex() {
    const rgb = parseHex(hexInput)
    if (!rgb) { setBad(true); return }
    onSet(normalize(rgb))
    setHexInput('')
    setBad(false)
  }

  if (color) {
    return (
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{label}</p>
        <div className="h-28 rounded-2xl border border-white/10" style={{ backgroundColor: color.hex }} />
        <p className="font-bold text-white leading-tight truncate">{color.name}</p>
        <p className="text-xs text-white/50 truncate">{color.family} · <span className="font-mono">{color.hex}</span></p>
        <button onClick={() => onSet(null)} className="text-xs text-white/25 hover:text-white/60 transition-colors text-left">Clear</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{label}</p>
      <div className="h-28 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-white/25 text-xs text-center px-2">
        Pick a color
      </div>
      <button
        onClick={() => currentColor && onSet(normalize(currentColor))}
        disabled={!currentColor}
        className="group/cap flex items-center justify-center gap-2 py-2 rounded-full bg-white/[0.08] text-white/75 text-xs font-semibold hover:bg-white/[0.15] hover:text-white transition-all duration-200 ease-spring active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
      >
        <CameraIcon size={13} /> Use last reading
      </button>
      {history.length > 0 && (
        <button
          onClick={() => setShowHistory(v => !v)}
          className="text-xs text-white/35 hover:text-white/65 transition-colors text-left"
        >
          {showHistory ? 'Hide saved colors' : 'Pick a saved color'}
        </button>
      )}
      {showHistory && (
        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
          {history.map(h => (
            <button
              key={h.id}
              onClick={() => onSet(normalize(h))}
              className="w-7 h-7 rounded-lg border border-white/10 hover:scale-110 transition-transform"
              style={{ backgroundColor: h.hex }}
              title={h.label || h.name}
              aria-label={`Use ${h.label || h.name}`}
            />
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className={`flex-1 min-w-0 bg-white/5 border rounded-full px-3 py-2 text-xs font-mono text-white placeholder-white/25 focus:outline-none ${bad ? 'border-red-400/60' : 'border-white/10 focus:border-white/30'}`}
          placeholder="#HEX"
          aria-label={`${label} hex code`}
          value={hexInput}
          onChange={e => { setHexInput(e.target.value); setBad(false) }}
          onKeyDown={e => e.key === 'Enter' && submitHex()}
        />
        <button onClick={submitHex} className="px-3.5 py-2 bg-white/[0.08] text-white/75 text-xs font-semibold rounded-full hover:bg-white/[0.16] hover:text-white transition-all duration-200 ease-spring active:scale-95">Set</button>
      </div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/45">{label}</span>
      <span className="text-sm font-semibold text-right">{children}</span>
    </div>
  )
}

export default function CompareMode({ currentColor, history, onBack }) {
  const { settings } = useSettings()
  const engine = useMemo(() => engineOptions(settings), [settings])
  const [colorA, setColorA] = useState(null)
  const [colorB, setColorB] = useState(null)
  const result = useMemo(
    () => (colorA && colorB ? compareColors(colorA, colorB, engine) : null),
    [colorA, colorB, engine],
  )
  const you = CVD_SHORT[settings.colorblindProfile]?.toLowerCase()

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] shrink-0">
        <button onClick={onBack} aria-label="Back" className="group/back w-8 h-8 rounded-full bg-white/5 border border-white/[0.06] flex items-center justify-center hover:bg-white/10 transition-all duration-200 ease-spring active:scale-90">
          <ArrowLeftIcon size={15} className="text-white/60 transition-transform duration-300 ease-spring group-hover/back:-translate-x-0.5" />
        </button>
        <div>
          <h2 className="font-bold text-white tracking-tight leading-tight">Compare two colors</h2>
          <p className="text-[11px] text-white/35">Do they match? Would you mix them up?</p>
        </div>
      </div>

      <div className="flex gap-4 p-5">
        <ColorSlot label="Color A" color={colorA} onSet={setColorA} currentColor={currentColor} history={history} />
        <div className="w-px bg-white/[0.06] self-stretch" />
        <ColorSlot label="Color B" color={colorB} onSet={setColorB} currentColor={currentColor} history={history} />
      </div>

      {result && (
        <div className="px-5 pb-6 flex flex-col gap-3">
          {result.forYou && (
            <div className={`flex items-start gap-2.5 px-4 py-3 rounded-2xl border ${result.forYou.likelyConfused ? 'bg-amber-500/10 border-amber-400/25 text-amber-100' : 'bg-green-500/10 border-green-400/20 text-green-100'}`}>
              {result.forYou.likelyConfused ? <WarningIcon size={16} className="shrink-0 mt-0.5" /> : <CheckIcon size={16} className="shrink-0 mt-0.5" strokeWidth={2.4} />}
              <p className="text-[13px] leading-relaxed">
                {result.forYou.likelyConfused
                  ? `These will likely look the same to you (${you} color vision), even though they're ${result.label.toLowerCase()}.`
                  : `You should be able to tell these apart with ${you} color vision.`}
              </p>
            </div>
          )}

          <div className="bg-white/5 border border-white/[0.06] rounded-2xl px-4 py-1">
            <Row label="Same color?">
              <span className={result.same ? 'text-brand-green' : 'text-white'}>{result.same ? 'Yes, a match' : 'No'}</span>
            </Row>
            <Row label="Difference">
              <span className="text-white">{result.label}</span>
              <span className="ml-1.5 text-white/35 font-normal font-mono text-xs">ΔE {result.deltaE.toFixed(1)}</span>
            </Row>
            <Row label="Look alike to">
              <span className={result.lookAlikeFor.length ? 'text-amber-300' : 'text-white/70'}>
                {result.lookAlikeFor.length ? result.lookAlikeFor.map(t => CVD_SHORT[t]).join(', ') : 'No common type'}
              </span>
            </Row>
            <Row label="Text contrast (WCAG)">
              <span className={result.contrast.rating === 'Fails' ? 'text-brand-red' : result.contrast.rating.startsWith('AA large') ? 'text-yellow-300' : 'text-brand-green'}>
                {result.contrast.ratio.toFixed(2)}:1 · {result.contrast.rating}
              </span>
            </Row>
          </div>

          {!result.forYou && (
            <p className="text-[12px] text-white/35 leading-relaxed">
              Set your color vision type in Settings to get a straight answer on whether you would mix these up.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
