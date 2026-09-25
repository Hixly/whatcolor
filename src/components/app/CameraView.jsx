import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../../contexts/SettingsContext'
import { engineOptions } from '../../contexts/engineOptions'
import { useCamera } from '../../hooks/useCamera'
import { useColorDetection } from '../../hooks/useColorDetection'
import ColorInfoPanel from './ColorInfoPanel'
import Reticle from './Reticle'
import { FlashIcon, PlayIcon, PauseIcon, UploadIcon, CompareIcon, HistoryIcon, SettingsIcon, CameraIcon, XIcon, HomeIcon, SunIcon, CheckIcon } from '../ui/Icons'

function SmallBtn({ onClick, active, children, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ease-spring active:scale-90 backdrop-blur-md ${
        active
          ? 'bg-white/30 text-white raised-light'
          : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white border border-white/[0.08]'
      }`}
    >
      {children}
    </button>
  )
}

function PermissionDenied({ onSwitchToUpload }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
        <CameraIcon size={28} className="text-white/60" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Camera access is off</h2>
        <p className="text-white/50 max-w-sm text-sm font-light leading-relaxed">
          WhatColor needs the camera to read colors live. Allow camera access for this site in your
          browser settings, then reload. Nothing ever leaves your device.
        </p>
      </div>
      <button
        onClick={onSwitchToUpload}
        className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full text-sm hover:bg-gray-100 transition-all"
      >
        <UploadIcon size={16} /> Use a photo instead
      </button>
    </div>
  )
}

function CameraUnavailable({ onSwitchToUpload }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
        <CameraIcon size={28} className="text-white/60" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-2">No camera found</h2>
        <p className="text-white/50 max-w-sm text-sm font-light">This device has no camera, or another app is using it.</p>
      </div>
      <button
        onClick={onSwitchToUpload}
        className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full text-sm hover:bg-gray-100 transition-all"
      >
        <UploadIcon size={16} /> Use a photo instead
      </button>
    </div>
  )
}

// Heights of the top bar and the bottom controls, so the reticle sits in the
// middle of the camera area you can actually see. Sampling follows the
// reticle wherever it is drawn, so these only affect layout.
const TOP_BAR_H = 80
const BOTTOM_H = 200

const WB_ERRORS = {
  'too-dark': 'Too dark to use. Aim at something white or light gray in good light.',
  'too-colorful': 'That looks colored. Aim at plain white paper or a white wall.',
  'no-camera': 'Camera not ready yet.',
}

export default function CameraView({ onColorChange, onSave, onSwitchToUpload, onSwitchToCompare, onSwitchToHistory }) {
  const { settings } = useSettings()
  const aimRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [tapPoint, setTapPoint] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [toast, setToast] = useState(null)
  const engine = useMemo(() => engineOptions(settings), [settings])
  const { videoRef, status, torchOn, start, stop, toggleTorch } = useCamera(settings.facingMode)
  const { color, samplePoint, spotPx, calibrateWhite, resetWhite, whiteBalanced } = useColorDetection({
    videoRef,
    aimRef,
    spot: settings.spot,
    engine,
    active: !paused && status === 'active',
  })

  useEffect(() => { start(); return stop }, [start, stop])
  useEffect(() => { if (color && onColorChange) onColorChange(color) }, [color, onColorChange])
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const handleTapOnPaused = useCallback((e) => {
    if (!paused) return
    const res = samplePoint(e.clientX, e.clientY)
    if (!res) return
    const rect = e.currentTarget.getBoundingClientRect()
    setTapPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [paused, samplePoint])

  function togglePause() {
    const next = !paused
    const video = videoRef.current
    // Actually freeze the frame, so a tap samples exactly what you see.
    if (video) {
      if (next) video.pause()
      else video.play().catch(() => {})
    }
    setPaused(next)
    setTapPoint(null)
    if (!next) setShowDetails(false)
  }

  function handleWhiteBalance() {
    if (whiteBalanced) {
      resetWhite()
      setToast({ kind: 'info', text: 'White balance reset to the camera default.' })
      return
    }
    const out = calibrateWhite()
    if (out.error) setToast({ kind: 'warn', text: WB_ERRORS[out.error] })
    else setToast({ kind: 'ok', text: 'White set. Colors are now corrected for this light.' })
  }

  if (status === 'denied') return <PermissionDenied onSwitchToUpload={onSwitchToUpload} />
  if (status === 'unavailable') return <CameraUnavailable onSwitchToUpload={onSwitchToUpload} />

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted aria-label="Camera feed" />

      {/* Tap overlay while frozen */}
      {paused && (
        <div
          className="absolute inset-0 cursor-crosshair"
          onClick={handleTapOnPaused}
          role="button"
          aria-label="Tap anywhere to read that color"
        />
      )}

      {/* ── Reticle ─────────────────────────────────────────────────────── */}
      {!tapPoint && (
        <div className="absolute inset-0 flex flex-col pointer-events-none">
          <div style={{ height: TOP_BAR_H }} />
          <div className="flex-1 flex items-center justify-center">
            <Reticle ref={aimRef} spot={spotPx} color={color?.hex} pulseKey={color?.name} breathe={!paused} />
          </div>
          <div style={{ height: BOTTOM_H }} />
        </div>
      )}
      {tapPoint && (
        <div
          className="absolute pointer-events-none"
          style={{ left: tapPoint.x, top: tapPoint.y, transform: 'translate(-50%, -50%)' }}
        >
          <Reticle spot={spotPx} color={color?.hex} pulseKey={color?.name} />
        </div>
      )}

      {paused && !tapPoint && (
        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ top: TOP_BAR_H + 6 }}>
          <span className="px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md text-white/85 text-xs font-medium border border-white/10">
            Frozen. Tap anywhere to read that spot.
          </span>
        </div>
      )}

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: TOP_BAR_H }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
        <div className="relative flex items-center justify-between h-full px-5 py-5">
          <Link
            to="/"
            className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white/70 hover:text-white transition-colors pointer-events-auto"
            aria-label="Home"
          >
            <HomeIcon size={18} />
          </Link>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleWhiteBalance}
              className={`h-10 pl-3 pr-3.5 rounded-full flex items-center gap-1.5 text-xs font-semibold backdrop-blur-md border transition-all duration-200 ease-spring active:scale-95 ${
                whiteBalanced
                  ? 'bg-white text-black border-white'
                  : 'bg-black/40 text-white/80 border-white/[0.08] hover:bg-black/60 hover:text-white'
              }`}
              aria-label={whiteBalanced ? 'White balance is set. Tap to reset.' : 'Set white balance from what is under the reticle'}
              title={whiteBalanced ? 'Reset white balance' : 'Aim at white paper, then tap'}
            >
              {whiteBalanced ? <CheckIcon size={14} strokeWidth={2.4} /> : <SunIcon size={15} />}
              {whiteBalanced ? 'White set' : 'Set white'}
            </button>
            <Link
              to="/settings"
              className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              aria-label="Settings"
            >
              <SettingsIcon size={17} />
            </Link>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="absolute inset-x-0 flex justify-center px-4 pointer-events-none z-40" style={{ top: TOP_BAR_H + 44 }}>
          <div
            role="status"
            className={`max-w-sm px-4 py-2.5 rounded-2xl text-[13px] leading-snug backdrop-blur-xl border shadow-xl animate-fade-in ${
              toast.kind === 'warn'
                ? 'bg-amber-500/20 border-amber-300/30 text-amber-100'
                : 'bg-black/70 border-white/10 text-white/90'
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}

      {/* ── Bottom section ────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: BOTTOM_H }}>
        <div className="px-3 pt-3 pb-2">
          <div className="grid grid-cols-3 items-center gap-1 px-3 py-2 rounded-full bg-black/35 backdrop-blur-xl border border-white/[0.08] raised-dark">
            <div className="flex items-center">
              <SmallBtn onClick={toggleTorch} active={torchOn} label="Toggle flashlight">
                <FlashIcon size={18} />
              </SmallBtn>
            </div>

            <div className="flex items-center justify-center">
              <button
                onClick={togglePause}
                aria-label={paused ? 'Resume live reading' : 'Freeze frame and tap to read'}
                className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-200 ease-spring active:scale-90 ${
                  paused
                    ? 'bg-white text-black raised-light'
                    : 'bg-white/20 border-2 border-white/50 text-white hover:bg-white/30 backdrop-blur-md shadow-xl'
                }`}
              >
                {paused ? <PlayIcon size={22} /> : <PauseIcon size={22} />}
              </button>
            </div>

            <div className="flex items-center justify-end gap-1.5">
              <SmallBtn onClick={onSwitchToUpload} label="Read a photo">
                <UploadIcon size={15} />
              </SmallBtn>
              <SmallBtn onClick={onSwitchToCompare} label="Compare colors">
                <CompareIcon size={15} />
              </SmallBtn>
              <SmallBtn onClick={onSwitchToHistory} label="Saved colors">
                <HistoryIcon size={15} />
              </SmallBtn>
            </div>
          </div>
        </div>

        <button
          className="w-full mx-0 px-3 mb-3 text-left"
          onClick={() => color && setShowDetails(true)}
          aria-label="Open color details"
        >
          <div
            className="backdrop-blur-xl rounded-2xl border border-white/[0.09] transition-[background] duration-500 ease-out raised-dark"
            style={{
              background: color
                ? `linear-gradient(180deg, ${color.hex}1f 0%, rgba(15,15,15,0.92) 60%)`
                : 'rgba(15,15,15,0.9)',
            }}
          >
            <ColorInfoPanel color={color} onSave={onSave} dark compact />
          </div>
        </button>
      </div>

      {/* ── Details bottom sheet ──────────────────────────────────────────── */}
      {showDetails && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetails(false)} />
          <div className="relative bg-[#111] rounded-t-3xl border-t border-white/[0.08] shadow-2xl max-h-[88%] overflow-y-auto">
            <div className="sticky top-0 bg-[#111] grid grid-cols-3 items-center px-3 pt-3 pb-1 z-10">
              <div />
              <div className="flex justify-center">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all duration-200 ease-spring active:scale-90"
                  aria-label="Close"
                >
                  <XIcon size={14} />
                </button>
              </div>
            </div>
            <div className="px-5 pt-1 pb-8">
              <ColorInfoPanel color={color} onSave={onSave} dark />
            </div>
          </div>
        </div>
      )}

      {status === 'requesting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
              <CameraIcon size={24} className="text-white" />
            </div>
            <p className="text-sm text-white/60 font-light">Starting the camera…</p>
          </div>
        </div>
      )}
    </div>
  )
}
