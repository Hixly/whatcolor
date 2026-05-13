import { useState } from 'react'
import { useSettings } from '../../contexts/SettingsContext'
import Button from '../ui/Button'

function CopyableValue({ label, value }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 px-3 py-2 bg-dark-bg rounded-lg hover:bg-[#111] transition-colors text-left group w-full"
      title="Tap to copy"
    >
      <span className="text-xs text-gray-500 uppercase tracking-widest w-8 shrink-0">{label}</span>
      <span className="font-mono text-sm text-gray-200 group-hover:text-white transition-colors truncate">{value}</span>
      <span className="ml-auto text-xs text-gray-600 group-hover:text-gray-400 transition-colors shrink-0">
        {copied ? '✓ copied' : 'copy'}
      </span>
    </button>
  )
}

export default function ColorInfoPanel({ color, onSave, className = '' }) {
  const { settings } = useSettings()

  if (!color) {
    return (
      <div className={`flex items-center justify-center h-32 text-gray-600 text-sm ${className}`}>
        Aim the crosshair at any color to begin
      </div>
    )
  }

  const swatchStyle = { backgroundColor: color.hex }

  const formats = {
    hex: <CopyableValue label="HEX" value={color.hex} />,
    rgb: <CopyableValue label="RGB" value={color.rgb} />,
    hsl: <CopyableValue label="HSL" value={color.hsl} />,
  }

  const primaryFormat = settings.colorFormat || 'hex'
  const otherFormats = ['hex', 'rgb', 'hsl'].filter(f => f !== primaryFormat)

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Swatch + name */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl shrink-0 shadow-lg border border-white/10"
          style={swatchStyle}
          aria-label={`Color swatch: ${color.hex}`}
        />
        <div className="min-w-0">
          <p className="text-xl font-bold text-white leading-tight truncate">{color.name}</p>
          <p className="text-sm text-gray-400 mt-0.5 truncate">{color.descriptive}</p>
          {color.reference && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{color.reference}</p>
          )}
        </div>
      </div>

      {/* Color values — primary format first, then others */}
      <div className="flex flex-col gap-1">
        {formats[primaryFormat]}
        {otherFormats.map(f => formats[f])}
      </div>

      {/* Confusion warning */}
      {color.confusion && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-yellow-950/40 border border-yellow-800/40 rounded-xl text-sm text-yellow-300">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>{color.confusion}</span>
        </div>
      )}

      {/* Save button */}
      {onSave && (
        <Button variant="secondary" size="sm" onClick={() => onSave(color)} className="w-full">
          🔖 Save to History
        </Button>
      )}
    </div>
  )
}
