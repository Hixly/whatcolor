import { useState } from 'react'
import { useSettings } from '../../contexts/SettingsContext'
import { CopyIcon, BookmarkIcon, CheckIcon, WarningIcon, SpeakerIcon, ShareIcon } from '../ui/Icons'
import { simulateCvd, CVD_PREVIEW_TYPES } from '../../utils/cvdSimulate'

function CopyableValue({ label, value, dark }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    let ok = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
        ok = true
      }
    } catch {
      ok = false
    }
    if (!ok) {
      // Fallback for non-secure contexts / denied permission.
      try {
        const ta = document.createElement('textarea')
        ta.value = value
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        ok = true
      } catch {
        ok = false
      }
    }
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ease-spring active:scale-[0.98] text-left group w-full ${
        dark
          ? 'bg-white/[0.06] hover:bg-white/[0.11] border border-white/[0.04]'
          : 'bg-gray-100 hover:bg-gray-200/80 border border-black/[0.03]'
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

  function handleSave(e) {
    if (e) e.stopPropagation()
    onSave?.(color)
    setSaved(true)
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([10, 30, 10])
    setTimeout(() => setSaved(false), 1500)
  }

  // Speak the color name aloud — just the name, no numbers.
  function speak(e) {
    if (e) e.stopPropagation()
    if (!color || typeof window === 'undefined' || !window.speechSynthesis) return
    const utter = new SpeechSynthesisUtterance(color.name)
    utter.rate = 0.95
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  // Share a single color via the native share sheet, falling back to clipboard.
  async function share(e) {
    if (e) e.stopPropagation()
    if (!color) return
    const text = `${color.name} — ${color.hex} · ${color.rgb}`
    try {
      if (navigator.share) {
        await navigator.share({ title: `${color.name} (${color.hex})`, text, url: 'https://what-color.com' })
        return
      }
    } catch {
      return // user cancelled the share sheet — do nothing
    }
    try { await navigator.clipboard?.writeText(`${text}\nwhat-color.com`) } catch { /* no-op */ }
  }

  // ── Compact: premium camera result card ────────────────────────────────────
  if (compact) {
    return (
      <div className={`px-4 py-3.5 ${className}`}>
        <div className="flex items-center gap-3.5">
          {/* Glowing live swatch — crossfades as the color changes */}
          <div
            className="w-[52px] h-[52px] rounded-[15px] shrink-0 transition-all duration-300 ease-out"
            style={{
              backgroundColor: color?.hex || 'rgba(255,255,255,0.06)',
              boxShadow: color
                ? `0 0 0 1px rgba(255,255,255,0.12), 0 4px 18px 0 ${color.hex}80`
                : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            }}
            aria-label={color ? `Color: ${color.hex}` : 'No color'}
          />
          <div className="flex-1 min-w-0">
            {color ? (
              <>
                <p className="font-semibold text-white text-[19px] leading-tight truncate">{color.name}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono text-[13px] text-white/90 tabular-nums">{color.hex.toUpperCase()}</span>
                  <span className="font-mono text-[11px] text-white/45 tabular-nums truncate">{color.r} · {color.g} · {color.b}</span>
                </div>
              </>
            ) : (
              <>
                <p className="text-white/70 text-[15px] font-medium leading-tight">Aim at a color</p>
                <p className="text-white/35 text-[12px] font-light mt-0.5">Hold steady to lock it in</p>
              </>
            )}
          </div>
          {onSave && color && (
            <button
              onClick={handleSave}
              aria-label={saved ? 'Saved' : 'Save to history'}
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ease-spring active:scale-90 ${
                saved
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-white/10 text-white/70 hover:bg-white/[0.18] hover:text-white border border-white/[0.08]'
              }`}
            >
              {saved ? <CheckIcon size={16} strokeWidth={2.5} /> : <BookmarkIcon size={16} />}
            </button>
          )}
        </div>

        {/* Plain-language description + tap hint */}
        {color && (color.descriptive || color.reference) && (
          <>
            <div className="mt-3 h-px bg-white/[0.07]" />
            <div className="mt-2.5 flex items-center gap-2">
              <p className="flex-1 text-[12px] text-white/50 font-light leading-snug truncate">
                {color.descriptive}{color.reference ? ` · ${color.reference}` : ''}
              </p>
              <span className="text-white/30 text-[10px] font-medium shrink-0 flex items-center gap-1">
                details <span className="text-white/20">›</span>
              </span>
            </div>
          </>
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
        {/* Speak aloud + share */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={speak}
            aria-label="Speak color name aloud"
            title="Speak aloud"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-spring active:scale-90 ${dark ? 'bg-white/[0.08] text-white/60 hover:bg-white/[0.16] hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`}
          >
            <SpeakerIcon size={16} />
          </button>
          <button
            onClick={share}
            aria-label="Share color"
            title="Share"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-spring active:scale-90 ${dark ? 'bg-white/[0.08] text-white/60 hover:bg-white/[0.16] hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`}
          >
            <ShareIcon size={15} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <CopyableValue label={primaryFormat.toUpperCase()} value={formatValues[primaryFormat]} dark={dark} />
        {otherFormats.map(f => (
          <CopyableValue key={f} label={f.toUpperCase()} value={formatValues[f]} dark={dark} />
        ))}
      </div>

      {/* How others might see this — CVD simulation preview */}
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${dark ? 'text-white/30' : 'text-gray-400'}`}>How others may see it</p>
        <div className="grid grid-cols-4 gap-2">
          {CVD_PREVIEW_TYPES.map(({ type, label }) => (
            <div key={type} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-full h-9 rounded-lg ${dark ? 'border border-white/10' : 'border border-black/5'}`}
                style={{ backgroundColor: simulateCvd(color.hex, type) }}
              />
              <span className={`text-[10px] font-medium ${dark ? 'text-white/40' : 'text-gray-400'}`}>{label}</span>
            </div>
          ))}
        </div>
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
          className={`group/save w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ease-spring active:scale-[0.96] active:duration-75 ${
            saved
              ? dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
              : dark ? 'bg-white/[0.09] text-white hover:bg-white/[0.16] raised-dark' : 'bg-[#111] text-white hover:bg-black raised-dark'
          }`}
        >
          {saved
            ? <CheckIcon size={15} strokeWidth={2.5} />
            : <BookmarkIcon size={15} className="transition-transform duration-300 ease-spring group-hover/save:scale-110 group-hover/save:-translate-y-0.5" />}
          {saved ? 'Saved' : 'Save to History'}
        </button>
      )}
    </div>
  )
}
