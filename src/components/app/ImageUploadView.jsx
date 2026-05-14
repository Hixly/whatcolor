import { useState, useRef, useEffect } from 'react'
import { useSettings } from '../../contexts/SettingsContext'
import { formatHex, formatRgb, formatHsl, rgbToHsl } from '../../utils/colorConversions'
import { nearestColorName } from '../../utils/colorNames'
import { descriptiveName, contextualReference } from '../../utils/colorDescriptions'
import { getConfusionWarning } from '../../utils/confusionPairs'
import CrosshairReticle from './CrosshairReticle'
import ColorInfoPanel from './ColorInfoPanel'

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
          className={`w-full max-w-md border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${dragging ? 'border-white bg-white/5' : 'border-dark-border hover:border-gray-500'}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="text-5xl mb-4">🖼️</div>
          <p className="text-white font-semibold mb-1">Drop an image here</p>
          <p className="text-gray-500 text-sm mb-5">or paste from clipboard (Ctrl+V)</p>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-semibold text-sm cursor-pointer hover:bg-gray-100 transition-colors">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
            Choose File
          </label>
        </div>
        <button onClick={onBack} className="text-gray-500 hover:text-white text-sm transition-colors">
          ← Back to camera
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

      {/* Crosshair at tap point */}
      <div
        className="absolute pointer-events-none"
        style={{ left: `${crosshair.x}%`, top: `${crosshair.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        <CrosshairReticle size={80} lineColor="white" />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <span className="font-bold text-white text-sm"><span className="font-normal">What</span>Color</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setImageSrc(null); setColor(null) }}
            className="p-2.5 rounded-xl text-lg bg-black/40 text-white hover:bg-black/60 transition-colors"
            title="Load new image"
          >
            🔄
          </button>
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl text-lg bg-black/40 text-white hover:bg-black/60 transition-colors"
            title="Back to camera"
          >
            📷
          </button>
        </div>
      </div>

      {/* Mobile color panel */}
      <div className="absolute bottom-0 left-0 right-0 lg:hidden">
        <div className="mx-3 mb-3 bg-dark-surface/95 backdrop-blur-md rounded-2xl p-4 border border-dark-border">
          {!color
            ? <p className="text-center text-gray-500 text-sm py-4">Tap anywhere on the image to identify a color</p>
            : <ColorInfoPanel color={color} onSave={onSave} />
          }
        </div>
      </div>
    </div>
  )
}
