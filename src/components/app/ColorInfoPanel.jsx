import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../../contexts/SettingsContext'
import { CopyIcon, BookmarkIcon, CheckIcon, WarningIcon, SpeakerIcon, ShareIcon } from '../ui/Icons'
import { simulateRgb, CVD_SHORT } from '../../engine/cvd'
import { identify, spokenSummary } from '../../engine/identify'
import { toHex } from '../../engine/colorMath'

const PREVIEW_TYPES = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia']

async function copyText(value) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = value
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    return true
  } catch {
    return false
  }
}

function CopyableValue({ label, value, dark }) {
  const [copied, setCopied] = useState(false)
  async function copy(e) {
    e.stopPropagation()
    if (await copyText(value)) {
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

function FamilyChip({ color, dark }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
        dark ? 'bg-white/[0.08] text-white/75' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {color.family} family
    </span>
  )
}

export default function ColorInfoPanel({ color, onSave, dark = false, compact = false, className = '' }) {
  const { settings } = useSettings()
  const [saved, setSaved] = useState(false)

  const previews = useMemo(() => {
    if (!color || compact) return []
    return PREVIEW_TYPES.map((type) => {
      const s = simulateRgb(color, type)
      return { type, hex: toHex(s.r, s.g, s.b), looks: identify(s.r, s.g, s.b).family }
    })
  }, [color, compact])

  function handleSave(e) {
    if (e) e.stopPropagation()
    onSave?.(color)
    setSaved(true)
    if (navigator.vibrate && navigator.userActivation?.hasBeenActive) navigator.vibrate([10, 30, 10])
    setTimeout(() => setSaved(false), 1500)
  }

  function speak(e) {
    if (e) e.stopPropagation()
    if (!color || !window.speechSynthesis) return
    const utter = new SpeechSynthesisUtterance(spokenSummary(color))
    utter.rate = 0.95
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  async function share(e) {
    if (e) e.stopPropagation()
    if (!color) return
    const text = `${color.name} (${color.family.toLowerCase()} family), ${color.hex}. ${color.description}.`
    try {
      if (navigator.share) {
        await navigator.share({ title: `${color.name} ${color.hex}`, text, url: 'https://what-color.com' })
        return
      }
    } catch {
      return // share sheet dismissed
    }
    await copyText(`${text}\nwhat-color.com`)
  }

  // ── Compact: live camera card ─────────────────────────────────────────────
  if (compact) {
    return (
      <div className={`px-4 py-3.5 ${className}`}>
        <div className="flex items-center gap-3.5">
          <div
            className="w-[52px] h-[52px] rounded-[15px] shrink-0 transition-all duration-300 ease-out"
            style={{
              backgroundColor: color?.hex || 'rgba(255,255,255,0.06)',
              boxShadow: color
                ? `0 0 0 1px rgba(255,255,255,0.12), 0 4px 18px 0 ${color.hex}80`
                : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            }}
            aria-hidden="true"
          />
          {/* Screen readers hear the name and family when they change, not every hex flicker */}
          <span className="sr-only" aria-live="polite">{color ? `${color.name}, ${color.family}` : ''}</span>
          <div className="flex-1 min-w-0" data-testid="live-card" aria-hidden="true">
            {color ? (
              <>
                <p className="font-semibold text-white text-[20px] leading-tight truncate">{color.name}</p>
                <p className="mt-1 text-[12px] text-white/55 truncate">
                  {/* Skip the family when the name already says it ("Light Blue") */}
                  {!color.name.toLowerCase().includes(color.family.toLowerCase()) && (
                    <>
                      <span className="text-white/80 font-medium">{color.family}</span>
                      <span className="mx-1.5 text-white/25">·</span>
                    </>
                  )}
                  <span className="font-mono tabular-nums">{color.hex}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-white/70 text-[15px] font-medium leading-tight">Aim at a color</p>
                <p className="text-white/35 text-[12px] font-light mt-0.5">Hold steady and the name locks in</p>
              </>
            )}
          </div>
          {onSave && color && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleSave}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSave(e) }}
              aria-label={saved ? 'Saved' : 'Save this color'}
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ease-spring active:scale-90 ${
                saved
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-white/10 text-white/70 hover:bg-white/[0.18] hover:text-white border border-white/[0.08]'
              }`}
            >
              {saved ? <CheckIcon size={16} strokeWidth={2.5} /> : <BookmarkIcon size={16} />}
            </span>
          )}
        </div>

        {color && (
          <>
            <div className="mt-3 h-px bg-white/[0.07]" />
            <div className="mt-2.5 flex items-center gap-2">
              <p className="flex-1 text-[12.5px] text-white/60 leading-snug truncate">
                {color.confusion ? (
                  <span className="text-amber-300/90">
                    <WarningIcon size={12} className="inline -mt-0.5 mr-1" />
                    Can look like {color.looksLike.join(' or ')} to you
                  </span>
                ) : (
                  color.description
                )}
              </p>
              <span className="text-white/35 text-[11px] font-medium shrink-0">
                details <span className="text-white/25">›</span>
              </span>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Full details ──────────────────────────────────────────────────────────
  if (!color) {
    return (
      <div className={`flex items-center justify-center h-28 text-sm font-light ${dark ? 'text-white/30' : 'text-gray-400'} ${className}`}>
        Aim the reticle at any color
      </div>
    )
  }

  const primaryFormat = settings.colorFormat || 'hex'
  const otherFormats = ['hex', 'rgb', 'hsl'].filter(f => f !== primaryFormat)
  const formatValues = { hex: color.hex, rgb: color.rgb, hsl: color.hsl }
  const hasProfile = settings.colorblindProfile && settings.colorblindProfile !== 'none'
  const muted = dark ? 'text-white/50' : 'text-gray-500'
  const faint = dark ? 'text-white/30' : 'text-gray-400'

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 rounded-2xl shrink-0 shadow-lg"
          style={{ backgroundColor: color.hex, boxShadow: `0 6px 24px -6px ${color.hex}` }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className={`text-[22px] font-bold leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>{color.name}</p>
          <div className="mt-1.5"><FamilyChip color={color} dark={dark} /></div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={speak}
            aria-label="Read the color aloud"
            title="Read aloud"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-spring active:scale-90 ${dark ? 'bg-white/[0.08] text-white/60 hover:bg-white/[0.16] hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`}
          >
            <SpeakerIcon size={16} />
          </button>
          <button
            onClick={share}
            aria-label="Share this color"
            title="Share"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-spring active:scale-90 ${dark ? 'bg-white/[0.08] text-white/60 hover:bg-white/[0.16] hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`}
          >
            <ShareIcon size={15} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className={`text-[15px] leading-snug ${dark ? 'text-white/85' : 'text-gray-800'}`}>{color.description}</p>
        {color.like && <p className={`text-[13px] ${muted}`}>{color.like.charAt(0).toUpperCase() + color.like.slice(1)}.</p>}
        {color.alsoCalled && (
          <p className={`text-[13px] ${muted}`}>
            On the edge. Some people would call it <span className={dark ? 'text-white/80' : 'text-gray-700'}>{color.alsoCalled}</span>.
          </p>
        )}
      </div>

      {color.confusion && (
        <div className={`flex items-start gap-2 px-3 py-2.5 rounded-2xl text-sm ${dark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-200' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
          <WarningIcon size={15} className="shrink-0 mt-0.5" />
          <span className="text-[13px] leading-relaxed">{color.confusion}</span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <CopyableValue label={primaryFormat.toUpperCase()} value={formatValues[primaryFormat]} dark={dark} />
        {otherFormats.map(f => (
          <CopyableValue key={f} label={f.toUpperCase()} value={formatValues[f]} dark={dark} />
        ))}
      </div>

      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${faint}`}>How it looks to others</p>
        <div className="grid grid-cols-4 gap-2">
          {previews.map(({ type, hex, looks }) => (
            <div key={type} className="flex flex-col items-center gap-1">
              <div
                className={`w-full h-9 rounded-lg ${dark ? 'border border-white/10' : 'border border-black/5'}`}
                style={{ backgroundColor: hex }}
                title={`${CVD_SHORT[type]}: reads as ${looks.toLowerCase()}`}
              />
              <span className={`text-[10px] font-semibold ${dark ? 'text-white/60' : 'text-gray-600'}`}>{CVD_SHORT[type]}</span>
              <span className={`text-[10px] -mt-0.5 ${faint}`}>{looks}</span>
            </div>
          ))}
        </div>
      </div>

      {!hasProfile && (
        <p className={`text-[12px] leading-relaxed ${faint}`}>
          Tip: set your color vision type in{' '}
          <Link to="/settings" className="underline underline-offset-2 hover:opacity-80">Settings</Link>{' '}
          and WhatColor will warn you about colors you might mix up.
        </p>
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
          {saved ? 'Saved' : 'Save color'}
        </button>
      )}
    </div>
  )
}
