import { useState, useRef, useEffect } from 'react'
import { useSettings } from '../../contexts/SettingsContext'
import { formatHex, formatRgb, formatHsl, rgbToHsl } from '../../utils/colorConversions'
import { nearestColorName } from '../../utils/colorNames'
import { descriptiveName, contextualReference } from '../../utils/colorDescriptions'
import { getConfusionWarning } from '../../utils/confusionPairs'
import ColorInfoPanel from './ColorInfoPanel'
import { ImageIcon, RefreshIcon, CameraIcon, ArrowLeftIcon, ChevronDownIcon } from '../ui/Icons'

function analyzePixel(r, g, b, profile) {
  const hsl = rgbToHsl(r, g, b)
  return {
    r, g, b,
    hex: formatHex(r, g, b),
    rgb: formatRgb(r, g, b),
    hsl: formatHsl(r, g, b),
    name: nearestColorName(r, g, b),
    descriptive: descriptiveName(r, g, b),
    reference: contextualReference(r, g, b),
    confusion: getConfusionWarning(hsl.h, hsl.s, hsl.l, profile),
  }
}

export default function ImageUploadView({ onSave, onBack }) {
  const { settings } = useSettings()
  const [imageSrc, setImageSrc] = useState(null)
  const [color, setColor] = useState(null)
  const [crosshair, setCrosshair] = useState({ x: 50, y: 50 })
  const [dragging, setDragging] = useState(false)
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const canvasRef = useRef(null)
  const imgRef = useRef(null)

  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      setImageSrc(e.target.result)
      setColor(null)
      setCrosshair({ x: 50, y: 50 })
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    loadFile(e.dataTransfer.files[0])
  }

  function handleFileInput(e) {
    loadFile(e.target.files[0])
  }

  useEffect(() => {
    function onPaste(e) {
      const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'))
      if (item) loadFile(item.getAsFile())
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [])

  function sampleAt(xPct, yPct) {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const x = Math.round((xPct / 100) * img.naturalWidth)
    const y = Math.round((yPct / 100) * img.naturalHeight)
    const size = settings.samplingSize
    const half = Math.floor(size / 2)
    const data = ctx.getImageData(Math.max(0, x - half), Math.max(0, y - half), size, size).data
    let r = 0, g = 0, b = 0
    const count = size * size
    for (let i = 0; i < count * 4; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2] }
    setColor(analyzePixel(Math.round(r / count), Math.round(g / count), Math.round(b / count), settings.colorblindProfile))
  }

  function handleImageClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const xPct = ((e.clientX - rect.left) / rect.width) * 100
    const yPct = ((e.clientY - rect.top) / rect.height) * 100
    setCrosshair({ x: xPct, y: yPct })
    sampleAt(xPct, yPct)
  }

  // Drop zone (no image loaded yet)
  if (!imageSrc) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 gap-6 bg-dark-bg">
        <div
          className={`w-full max-w-md border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ease-soft ${dragging ? 'border-white/60 bg-white/[0.06] scale-[1.01]' : 'border-white/[0.12] hover:border-white/25'}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center transition-transform duration-300 ease-spring ${dragging ? 'scale-110' : ''}`}>
            <ImageIcon size={28} className="text-white/70" strokeWidth={1.6} />
          </div>
          <p className="text-white font-semibold mb-1">Drop an image here</p>
          <p className="text-gray-500 text-sm mb-6 font-light">or paste from clipboard (Ctrl+V)</p>
          <label className="group/file inline-flex items-center gap-2 px-6 py-3 bg-[#111] text-white rounded-full font-semibold text-sm cursor-pointer raised-dark hover:bg-black hover:-translate-y-0.5 transition-all duration-200 ease-spring active:scale-[0.97] active:duration-75 select-none">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
            <ImageIcon size={16} className="transition-transform duration-300 ease-spring group-hover/file:scale-110" />
            Choose File
          </label>
        </div>
        <button onClick={onBack} className="group/back inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors">
          <ArrowLeftIcon size={15} className="transition-transform duration-300 ease-spring group-hover/back:-translate-x-0.5" />
          Back to camera
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Image */}
      <div
        className="absolute inset-0 flex items-center justify-center cursor-crosshair"
        onClick={handleImageClick}
      >
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Uploaded for color detection"
          className="max-w-full max-h-full object-contain select-none"
          crossOrigin="anonymous"
        />
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {/* Crosshair at tap point — the iconic WhatColor target reader */}
      <div
        className="absolute pointer-events-none w-max"
        style={{ left: `${crosshair.x}%`, top: `${crosshair.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        <img
          src="/logo-symbol-transparent.png"
          srcSet="/logo-symbol-transparent.png 1x, /logo-symbol-transparent@2x.png 2x"
          alt=""
          className="h-[80px] w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
          draggable={false}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 via-black/20 to-transparent">
        <span className="font-bold text-white text-sm tracking-tight"><span className="font-normal">What</span>Color</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setImageSrc(null); setColor(null) }}
            className="group/new w-10 h-10 rounded-full flex items-center justify-center bg-black/40 text-white/70 border border-white/[0.08] hover:bg-black/60 hover:text-white transition-all duration-200 ease-spring active:scale-90 backdrop-blur-md"
            aria-label="Load new image"
            title="Load new image"
          >
            <RefreshIcon size={17} className="transition-transform duration-500 ease-spring group-hover/new:rotate-180" />
          </button>
          <button
            onClick={onBack}
            className="group/cam w-10 h-10 rounded-full flex items-center justify-center bg-black/40 text-white/70 border border-white/[0.08] hover:bg-black/60 hover:text-white transition-all duration-200 ease-spring active:scale-90 backdrop-blur-md"
            aria-label="Back to camera"
            title="Back to camera"
          >
            <CameraIcon size={17} className="transition-transform duration-300 ease-spring group-hover/cam:scale-110" />
          </button>
        </div>
      </div>

      {/* Mobile color panel — collapsible tinted glass so it never blocks the photo */}
      <div className="absolute bottom-0 left-0 right-0 lg:hidden pointer-events-none">
        {/* Sliding panel */}
        <div
          className="px-3 pb-3 transition-transform duration-300 ease-soft pointer-events-auto"
          style={{ transform: panelCollapsed ? 'translateY(120%)' : 'translateY(0)' }}
        >
          <div
            className="p-4 pt-2 backdrop-blur-xl rounded-2xl border border-white/[0.09] transition-[background] duration-500 ease-out raised-dark"
            style={{
              background: color
                ? `linear-gradient(180deg, ${color.hex}1f 0%, rgba(17,17,17,0.94) 60%)`
                : 'rgba(17,17,17,0.92)',
            }}
          >
            {/* Grabber — tap to hide the panel */}
            <button
              onClick={() => setPanelCollapsed(true)}
              aria-label="Hide color panel"
              className="w-full flex flex-col items-center gap-1 pb-2 -mt-1 group/grab active:scale-[0.98] transition-transform"
            >
              <span className="w-9 h-1 rounded-full bg-white/25 group-hover/grab:bg-white/40 transition-colors" />
              <ChevronDownIcon size={14} className="text-white/30 group-hover/grab:text-white/55 transition-colors" />
            </button>

            {!color
              ? (
                <div className="flex items-center gap-3 py-1">
                  <div className="w-[52px] h-[52px] rounded-[15px] shrink-0 bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                    <ImageIcon size={22} className="text-white/40" />
                  </div>
                  <div>
                    <p className="text-white/70 text-[15px] font-medium leading-tight">Tap anywhere on the image</p>
                    <p className="text-white/35 text-[12px] font-light mt-0.5">Pick a point to identify its color</p>
                  </div>
                </div>
              )
              : <ColorInfoPanel color={color} onSave={onSave} dark />
            }
          </div>
        </div>

        {/* Collapsed HUD pill — live swatch + hex, tap to bring the panel back */}
        <button
          onClick={() => setPanelCollapsed(false)}
          aria-label="Show color panel"
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-2.5 pl-2 pr-3 py-2 rounded-full bg-[#111]/85 backdrop-blur-xl border border-white/10 raised-dark transition-all duration-300 ease-spring active:scale-95 pointer-events-auto ${
            panelCollapsed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          {color ? (
            <>
              <span className="w-6 h-6 rounded-full shrink-0" style={{ backgroundColor: color.hex, boxShadow: `0 0 10px 0 ${color.hex}80` }} />
              <span className="font-mono text-[13px] text-white/90 tabular-nums">{color.hex.toUpperCase()}</span>
            </>
          ) : (
            <span className="text-[13px] text-white/70 font-medium pl-1">Show color</span>
          )}
          <ChevronDownIcon size={14} className="text-white/45 rotate-180" />
        </button>
      </div>
    </div>
  )
}
