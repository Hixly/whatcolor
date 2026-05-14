import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../../contexts/SettingsContext'
import { useCamera } from '../../hooks/useCamera'
import { useColorDetection } from '../../hooks/useColorDetection'
import ColorInfoPanel from './ColorInfoPanel'
import { FlashIcon, PlayIcon, PauseIcon, UploadIcon, CompareIcon, HistoryIcon, SettingsIcon, CameraIcon } from '../ui/Icons'

function SmallBtn({ onClick, active, children, label, className = '' }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
        active
          ? 'bg-white/30 text-white'
          : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'
      } ${className}`}
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

export default function CameraView({ onColorChange, onSave, onSwitchToUpload, onSwitchToCompare, onSwitchToHistory }) {
  const { settings } = useSettings()
  const canvasRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [tapPoint, setTapPoint] = useState(null)
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
    setPaused(v => !v)
    setTapPoint(null)
  }

  if (status === 'denied') return <PermissionDenied />
  if (status === 'unavailable') return <CameraUnavailable onSwitchToUpload={onSwitchToUpload} />

  // Bottom section is ~200px: color pill (72px) + controls row (80px) + gaps/padding
  const BOTTOM_HEIGHT = 200

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Camera feed — full bleed */}
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted aria-label="Camera feed" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Tap overlay (pause mode) */}
      {paused && (
        <div
          className="absolute inset-0 cursor-crosshair"
          onClick={handleTapOnPaused}
          role="button"
          aria-label="Tap to sample color at this point"
        />
      )}

      {/* ── Top bar — minimal: home left, settings right ──────────────────── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-safe py-4 bg-gradient-to-b from-black/60 via-black/20 to-transparent">
        <Link
          to="/"
          className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center"
          aria-label="Home"
        >
          {/* logo-symbol-transparent.png: brightness-0 invert makes it pure white */}
          <img
            src="/logo-symbol-transparent.png"
            alt=""
            className="h-5 w-5 object-contain brightness-0 invert"
            draggable={false}
          />
        </Link>
        <Link
          to="/settings"
          className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="Settings"
        >
          <SettingsIcon size={17} />
        </Link>
      </div>

      {/* ── Crosshair — centered in the visible camera area above controls ── */}
      {!paused || !tapPoint ? (
        <div
          className="absolute inset-x-0 top-0 pointer-events-none flex items-center justify-center"
          style={{ bottom: BOTTOM_HEIGHT }}
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
      ) : (
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

      {/* ── Bottom section ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: BOTTOM_HEIGHT }}>

        {/* Controls row: flash | [compare, history, upload] | PAUSE (center) */}
        <div className="flex items-center justify-between px-7 pt-4 pb-2">
          {/* Left: torch */}
          <SmallBtn onClick={toggleTorch} active={torchOn} label="Toggle flashlight">
            <FlashIcon size={18} />
          </SmallBtn>

          {/* Center: pause/resume — hero button */}
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

          {/* Right: secondary tools cluster */}
          <div className="flex items-center gap-1.5">
            <SmallBtn onClick={onSwitchToUpload} label="Upload image">
              <UploadIcon size={16} />
            </SmallBtn>
            <SmallBtn onClick={onSwitchToCompare} label="Compare colors">
              <CompareIcon size={16} />
            </SmallBtn>
            <SmallBtn onClick={onSwitchToHistory} label="Color history">
              <HistoryIcon size={16} />
            </SmallBtn>
          </div>
        </div>

        {/* Color info — compact pill */}
        <div className="mx-3 mb-3 bg-[#0f0f0f]/90 backdrop-blur-xl rounded-2xl border border-white/[0.07]">
          <ColorInfoPanel color={color} onSave={onSave} dark compact />
        </div>
      </div>

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
