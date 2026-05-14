import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../../contexts/SettingsContext'
import { useCamera } from '../../hooks/useCamera'
import { useColorDetection } from '../../hooks/useColorDetection'
import CrosshairReticle from './CrosshairReticle'
import ColorInfoPanel from './ColorInfoPanel'
import Button from '../ui/Button'

function PermissionDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <div className="text-5xl">🚫</div>
      <h2 className="text-xl font-bold text-white">Camera access denied</h2>
      <p className="text-gray-400 max-w-sm text-sm">
        WhatColor needs camera access to identify colors. Open your browser settings and allow camera access for this site, then refresh the page.
      </p>
    </div>
  )
}

function CameraUnavailable({ onSwitchToUpload }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <div className="text-5xl">📷</div>
      <h2 className="text-xl font-bold text-white">No camera detected</h2>
      <p className="text-gray-400 max-w-sm text-sm">This device doesn't have a camera, or camera access is unavailable.</p>
      <Button onClick={onSwitchToUpload}>Upload an Image Instead</Button>
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

  useEffect(() => {
    start()
    return stop
  }, [start, stop])

  // Notify parent when color changes
  useEffect(() => {
    if (color && onColorChange) onColorChange(color)
  }, [color, onColorChange])

  function handleTapOnPaused(e) {
    if (!paused) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = e.currentTarget.getBoundingClientRect()
    const xRatio = (e.clientX - rect.left) / rect.width
    const yRatio = (e.clientY - rect.top) / rect.height
    const x = Math.round(xRatio * canvas.width)
    const y = Math.round(yRatio * canvas.height)
    setTapPoint({ xPct: xRatio * 100, yPct: yRatio * 100 })
    samplePoint(x, y)
  }

  if (status === 'denied') return <PermissionDenied />
  if (status === 'unavailable') return <CameraUnavailable onSwitchToUpload={onSwitchToUpload} />

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Video feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        aria-label="Camera feed"
      />

      {/* Hidden canvas for pixel sampling */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Tap overlay when paused — clicking moves crosshair and samples that pixel */}
      {paused && (
        <div
          className="absolute inset-0 cursor-crosshair"
          onClick={handleTapOnPaused}
          role="button"
          aria-label="Tap to sample color at this point"
        />
      )}

      {/* Crosshair — centered normally, moves to tap point when paused */}
      <div
        className="absolute pointer-events-none"
        style={
          paused && tapPoint
            ? { left: `${tapPoint.xPct}%`, top: `${tapPoint.yPct}%`, transform: 'translate(-50%, -50%)' }
            : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
        }
      >
        <CrosshairReticle size={80} lineColor="white" />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <Link to="/" className="font-bold text-white text-sm tracking-tight">
          <span className="font-normal">What</span>Color
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTorch}
            className={`p-2.5 rounded-xl text-lg transition-colors ${torchOn ? 'bg-yellow-500/30 text-yellow-300' : 'bg-black/40 text-white hover:bg-black/60'}`}
            aria-label="Toggle flashlight"
            title="Toggle flashlight"
          >
            🔦
          </button>
          <button
            onClick={() => { setPaused(v => !v); setTapPoint(null) }}
            className={`p-2.5 rounded-xl text-lg transition-colors ${paused ? 'bg-white/20 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
            aria-label={paused ? 'Resume camera' : 'Pause camera'}
            title={paused ? 'Resume' : 'Pause & tap to sample'}
          >
            {paused ? '▶️' : '⏸️'}
          </button>
          <button
            onClick={onSwitchToUpload}
            className="p-2.5 rounded-xl text-lg bg-black/40 text-white hover:bg-black/60 transition-colors"
            aria-label="Upload image"
            title="Upload image"
          >
            📁
          </button>
          <button
            onClick={onSwitchToCompare}
            className="p-2.5 rounded-xl text-lg bg-black/40 text-white hover:bg-black/60 transition-colors"
            aria-label="Compare colors"
            title="Compare colors"
          >
            ⚖️
          </button>
          <button
            onClick={onSwitchToHistory}
            className="p-2.5 rounded-xl text-lg bg-black/40 text-white hover:bg-black/60 transition-colors"
            aria-label="Color history"
            title="Color history"
          >
            🕐
          </button>
          <Link
            to="/settings"
            className="p-2.5 rounded-xl text-lg bg-black/40 text-white hover:bg-black/60 transition-colors"
            aria-label="Settings"
          >
            ⚙️
          </Link>
        </div>
      </div>

      {/* Mobile bottom color info panel — hidden on lg+ (desktop uses sidebar) */}
      <div className="absolute bottom-0 left-0 right-0 lg:hidden">
        <div className="mx-3 mb-3 bg-dark-surface/95 backdrop-blur-md rounded-2xl p-4 border border-dark-border">
          <ColorInfoPanel color={color} onSave={onSave} />
        </div>
      </div>

      {/* Camera requesting state */}
      {status === 'requesting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-white text-center">
            <div className="text-4xl mb-3 animate-pulse">📷</div>
            <p className="text-sm text-gray-300">Requesting camera access…</p>
          </div>
        </div>
      )}
    </div>
  )
}
