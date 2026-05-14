import { useState } from 'react'
import { useSettings } from '../../contexts/SettingsContext'
import { CopyIcon, BookmarkIcon, CheckIcon, WarningIcon } from '../ui/Icons'

function CopyableValue({ label, value, dark }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150 text-left group w-full ${
        dark
          ? 'bg-white/5 hover:bg-white/10'
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
      title="Tap to copy"
    >
      <span className={`text-[10px] font-bold uppercase tracking-widest w-8 shrink-0 ${dark ? 'text-white/30' : 'text-gray-400'}`}>
        {label}
      </span>
      <span className={`font-mono text-sm truncate flex-1 ${dark ? 'text-white/80' : 'text-gray-800'}`}>{value}</span>
      <span className={`shrink-0 transition-all duration-150 ${copied ? 'text-brand-green' : dark ? 'text-white/20 group-hover:text-white/40' : 'text-gray-300 group-hover:text-gray-500'}`}>
        {copied ? <CheckIcon size={13} strokeWidth={2.5} /> : <CopyIcon size={13} />}
      </span>
    </button>
  )
}

export default function ColorInfoPanel({ color, onSave, dark = false, compact = false, className = '' }) {
  const { settings } = useSettings()
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSave?.(color)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  // ── Compact mode: single-row pill for camera overlay ──────────────────────
  if (compact) {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 ${className}`}>
        <div
          className="w-11 h-11 rounded-xl shrink-0 border border-white/10"
          style={{ backgroundColor: color?.hex || '#1a1a1a' }}
          aria-label={color ? `Color: ${color.hex}` : 'No color'}
        />
        <div className="flex-1 min-w-0">
          {color ? (
            <>
              <p className="font-bold text-white text-sm leading-tight truncate">{color.name}</p>
              <p className="text-[11px] text-white/40 truncate mt-0.5">
                <span className="font-mono">{color.hex}</span>
                {color.descriptive && <span> · {color.descriptive}</span>}
              </p>
              {color.confusion && (
                <p className="text-[10px] text-yellow-400/70 truncate mt-0.5">{color.confusion}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-white/30 font-light">Aim crosshair at a color</p>
          )}
        </div>
        {onSave && color && (
          <button
            onClick={handleSave}
            aria-label={saved ? 'Saved' : 'Save to history'}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-95 ${
              saved
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
            }`}
          >
            {saved ? <CheckIcon size={15} strokeWidth={2.5} /> : <BookmarkIcon size={15} />}
          </button>
        )}
      </div>
    )
  }

  // ── Full mode ─────────────────────────────────────────────────────────────
  if (!color) {
    return (
      <div className={`flex items-center justify-center h-28 text-sm font-light ${dark ? 'text-white/30' : 'text-gray-400'} ${className}`}>
        Aim the crosshair at any color
      </div>
    )
  }

  const swatchStyle = { backgroundColor: color.hex }
  const primaryFormat = settings.colorFormat || 'hex'
  const otherFormats = ['hex', 'rgb', 'hsl'].filter(f => f !== primaryFormat)
  const formatValues = { hex: color.hex, rgb: color.rgb, hsl: color.hsl }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl shrink-0 shadow-lg"
          style={swatchStyle}
          aria-label={`Color: ${color.hex}`}
        />
        <div className="min-w-0 flex-1">
          <p className={`text-lg font-bold leading-tight truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{color.name}</p>
          <p className={`text-sm mt-0.5 truncate font-light ${dark ? 'text-white/50' : 'text-gray-500'}`}>{color.descriptive}</p>
          {color.reference && (
            <p className={`text-xs mt-0.5 truncate ${dark ? 'text-white/30' : 'text-gray-400'}`}>{color.reference}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <CopyableValue label={primaryFormat.toUpperCase()} value={formatValues[primaryFormat]} dark={dark} />
        {otherFormats.map(f => (
          <CopyableValue key={f} label={f.toUpperCase()} value={formatValues[f]} dark={dark} />
        ))}
      </div>

      {color.confusion && (
        <div className={`flex items-start gap-2 px-3 py-2.5 rounded-2xl text-sm ${dark ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-300' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
          <WarningIcon size={15} className="shrink-0 mt-0.5" />
          <span className="font-light text-xs leading-relaxed">{color.confusion}</span>
        </div>
      )}

      {onSave && (
        <button
          onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
            saved
              ? dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
              : dark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {saved ? <CheckIcon size={15} strokeWidth={2.5} /> : <BookmarkIcon size={15} />}
          {saved ? 'Saved' : 'Save to History'}
        </button>
      )}
    </div>
  )
}
