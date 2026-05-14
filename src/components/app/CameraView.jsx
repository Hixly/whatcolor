import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../../contexts/SettingsContext'
import { useCamera } from '../../hooks/useCamera'
import { useColorDetection } from '../../hooks/useColorDetection'
import ColorInfoPanel from './ColorInfoPanel'
import { FlashIcon, PlayIcon, PauseIcon, UploadIcon, CompareIcon, HistoryIcon, SettingsIcon, CameraIcon, XIcon } from '../ui/Icons'

function SmallBtn({ onClick, active, children, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
        active
          ? 'bg-white/30 text-white'
          : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function PermissionDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
        <CameraIcon size={28} className="text-white/60" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Camera access denied</h2>
        <p className="text-white/50 max-w-sm text-sm font-light leading-relaxed">
          WhatColor needs camera access to identify colors. Open your browser settings and allow access for this site, then refresh.
        </p>
      </div>
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
        <h2 className="text-xl font-bold text-white mb-2">No camera detected</h2>
        <p className="text-white/50 max-w-sm text-sm font-light">This device doesn't have a camera, or access is unavailable.</p>
      </div>
      <button
        onClick={onSwitchToUpload}
        className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full text-sm hover:bg-gray-100 transition-all"
      >
        <UploadIcon size={16} /> Upload an Image
      </button>
    </div>
  )
}

// Actual pixel heights of the top bar and bottom section so the crosshair
// can be centered in the visible camera area between them.
// Top bar: py-5 (20+20) + 40px icon = 80px
// Bottom: controls grid pt-4(16)+60px button+pb-2(8) = 84px
//         pill py-3(24) + h-11 content(44) + mb-3 margin(12) = 80px
//         total = 164px
const TOP_BAR_H = 80
const BOTTOM_H = 164

export default function CameraView({ onColorChange, onSave, onSwitchToUpload, onSwitchToCompare, onSwitchToHistory }) {
  const { settings } = useSettings()
  const canvasRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [tapPoint, setTapPoint] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const { videoRef, status, torchOn, start, stop, toggleTorch } = useCamera(settings.facingMode)
  const { color, samplePoint } = useColorDetection({
    videoRef,
    canvasRef,
    samplingSize: settings.samplingSize,
    profile: settings.colorblindProfile,
    active: !paused && status === 'active',
  })

  useEffect(() => { start(); return stop }, [start, stop])
  useEffect(() => { if (color && onColorChange) onColorChange(color) }, [color, onColorChange])

  function handleTapOnPaused(e) {
    if (!paused) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = e.currentTarget.getBoundingClientRect()
    const xRatio = (e.clientX - rect.left) / rect.width
    const yRatio = (e.clientY - rect.top) / rect.height
    setTapPoint({ xPct: xRatio * 100, yPct: yRatio * 100 })
    samplePoint(Math.round(xRatio * canvas.width), Math.round(yRatio * canvas.height))
  }

  function togglePause() {
    const next = !paused
    setPaused(next)
    setTapPoint(null)
    if (!next) setShowDetails(false)
  }

  if (status === 'denied') return <PermissionDenied />
  if (status === 'unavailable') return <CameraUnavailable onSwitchToUpload={onSwitchToUpload} />

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Camera feed — full bleed */}
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted aria-label="Camera feed" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Tap overlay (pause mode only) — sits below top bar and bottom section */}
      {paused && (
        <div
          className="absolute inset-0 cursor-crosshair"
          onClick={handleTapOnPaused}
          role="button"
          aria-label="Tap to sample color at this point"
        />
      )}

      {/* ── Crosshair ─────────────────────────────────────────────────────── */}
      {/* Default: perfectly centered between top bar and bottom section */}
      {(!paused || !tapPoint) && (
        <div className="absolute inset-0 flex flex-col pointer-events-none">
          <div style={{ height: TOP_BAR_H }} />
          <div className="flex-1 flex items-center justify-center">
            <img
              src="/logo-symbol-white.png"
              alt=""
              width={88}
              height={88}
              className="drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]"
              draggable={false}
            />
          </div>
          <div style={{ height: BOTTOM_H }} />
        </div>
      )}

      {/* Tap-to-sample: follows where user tapped */}
      {paused && tapPoint && (
        <div
          className="absolute pointer-events-none transition-all duration-150"
          style={{
            left: `${tapPoint.xPct}%`,
            top: `${tapPoint.yPct}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img
            src="/logo-symbol-white.png"
            alt=""
            width={88}
            height={88}
            className="drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]"
            draggable={false}
          />
        </div>
      )}

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      {/* pointer-events-none on wrapper so gradient doesn't block camera taps */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: TOP_BAR_H }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
        <div className="relative flex items-center justify-between h-full px-5 py-5">
          <Link
            to="/"
            className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center pointer-events-auto"
            aria-label="Home"
          >
            <img
              src="/logo-symbol-transparent.png"
              alt=""
              className="h-5 w-5 object-contain brightness-0 invert"
              draggable={false}
            />
          </Link>
          <Link
            to="/settings"
            className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white/70 hover:text-white transition-colors pointer-events-auto"
            aria-label="Settings"
          >
            <SettingsIcon size={17} />
          </Link>
        </div>
      </div>

      {/* ── Bottom section ────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: BOTTOM_H }}>
        {/* Controls — 3-column grid guarantees pause button is at exact center */}
        <div className="grid grid-cols-3 items-center px-6 pt-4 pb-2">
          {/* Left: torch */}
          <div className="flex items-center">
            <SmallBtn onClick={toggleTorch} active={torchOn} label="Toggle flashlight">
              <FlashIcon size={18} />
            </SmallBtn>
          </div>

          {/* Center: pause/resume hero button */}
          <div className="flex items-center justify-center">
            <button
              onClick={togglePause}
              aria-label={paused ? 'Resume' : 'Pause & tap to sample'}
              className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xl ${
                paused
                  ? 'bg-white text-black'
                  : 'bg-white/20 border-2 border-white/50 text-white hover:bg-white/30'
              }`}
            >
              {paused ? <PlayIcon size={22} /> : <PauseIcon size={22} />}
            </button>
          </div>

          {/* Right: secondary tools */}
          <div className="flex items-center justify-end gap-1.5">
            <SmallBtn onClick={onSwitchToUpload} label="Upload image">
              <UploadIcon size={15} />
            </SmallBtn>
            <SmallBtn onClick={onSwitchToCompare} label="Compare colors">
              <CompareIcon size={15} />
            </SmallBtn>
            <SmallBtn onClick={onSwitchToHistory} label="Color history">
              <HistoryIcon size={15} />
            </SmallBtn>
          </div>
        </div>

        {/* Color info pill — tap to open full details sheet */}
        <button
          className="w-full mx-0 px-3 mb-3 text-left"
          onClick={() => color && setShowDetails(true)}
          aria-label="Tap to view color details"
        >
          <div className="bg-[#0f0f0f]/90 backdrop-blur-xl rounded-2xl border border-white/[0.07]">
            <ColorInfoPanel color={color} onSave={onSave} dark compact />
          </div>
        </button>
      </div>

      {/* ── Details bottom sheet ──────────────────────────────────────────── */}
      {showDetails && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          {/* Dim backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDetails(false)}
          />
          {/* Sheet */}
          <div className="relative bg-[#111] rounded-t-3xl border-t border-white/[0.08] shadow-2xl">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>
            {/* Close button */}
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-3 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
              aria-label="Close"
            >
              <XIcon size={14} />
            </button>
            <div className="px-5 pt-2 pb-8">
              <ColorInfoPanel color={color} onSave={onSave} dark />
            </div>
          </div>
        </div>
      )}

      {/* Camera requesting overlay */}
      {status === 'requesting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
              <CameraIcon size={24} className="text-white" />
            </div>
            <p className="text-sm text-white/60 font-light">Requesting camera access…</p>
          </div>
        </div>
      )}
    </div>
  )
}
