import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../../contexts/SettingsContext'
import { useCamera } from '../../hooks/useCamera'
import { useColorDetection } from '../../hooks/useColorDetection'
import ColorInfoPanel from './ColorInfoPanel'
import { FlashIcon, PlayIcon, PauseIcon, UploadIcon, CompareIcon, HistoryIcon, SettingsIcon, CameraIcon } from '../ui/Icons'

function IconBtn({ onClick, active, children, label, className = '' }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
        active
          ? 'bg-white/25 text-white'
          : 'bg-black/30 text-white/80 hover:bg-black/50 hover:text-white'
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

  if (status === 'denied') return <PermissionDenied />
  if (status === 'unavailable') return <CameraUnavailable onSwitchToUpload={onSwitchToUpload} />

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted aria-label="Camera feed" />
      <canvas ref={canvasRef} className="hidden" />

      {paused && (
        <div className="absolute inset-0 cursor-crosshair" onClick={handleTapOnPaused}
          role="button" aria-label="Tap to sample color at this point" />
      )}

      {/* Crosshair — actual logo symbol, white-line variant for camera visibility */}
      <div
        className="absolute pointer-events-none transition-all duration-150"
        style={
          paused && tapPoint
            ? { left: `${tapPoint.xPct}%`, top: `${tapPoint.yPct}%`, transform: 'translate(-50%, -50%)' }
            : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
        }
      >
        <img
          src="/logo-symbol-white.png"
          alt=""
          width={88}
          height={88}
          className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
          draggable={false}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe py-3 bg-gradient-to-b from-black/70 via-black/20 to-transparent">
        <Link to="/">
          <img src="/logo-symbol.png" alt="WhatColor" className="h-7 w-7 object-contain brightness-0 invert" />
        </Link>
        <div className="flex items-center gap-1.5">
          <IconBtn onClick={toggleTorch} active={torchOn} label="Toggle flashlight">
            <FlashIcon size={16} />
          </IconBtn>
          <IconBtn onClick={() => { setPaused(v => !v); setTapPoint(null) }} active={paused} label={paused ? 'Resume' : 'Pause & tap to sample'}>
            {paused ? <PlayIcon size={16} /> : <PauseIcon size={16} />}
          </IconBtn>
          <IconBtn onClick={onSwitchToUpload} label="Upload image">
            <UploadIcon size={16} />
          </IconBtn>
          <IconBtn onClick={onSwitchToCompare} label="Compare colors">
            <CompareIcon size={16} />
          </IconBtn>
          <IconBtn onClick={onSwitchToHistory} label="Color history">
            <HistoryIcon size={16} />
          </IconBtn>
          <Link
            to="/settings"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-black/30 text-white/80 hover:bg-black/50 hover:text-white transition-all duration-200"
            aria-label="Settings"
          >
            <SettingsIcon size={16} />
          </Link>
        </div>
      </div>

      {/* Mobile bottom panel */}
      <div className="absolute bottom-0 left-0 right-0 lg:hidden">
        <div className="mx-3 mb-3 bg-[#111]/90 backdrop-blur-xl rounded-3xl p-4 border border-white/10">
          <ColorInfoPanel color={color} onSave={onSave} dark />
        </div>
      </div>

      {/* Camera requesting */}
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
