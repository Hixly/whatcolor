import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useSettings } from '../../contexts/SettingsContext'
import { engineOptions } from '../../contexts/engineOptions'
import { identify } from '../../engine/identify'
import { createSampler, SPOT_SIZES } from '../../engine/sampler'
import ColorInfoPanel from './ColorInfoPanel'
import Reticle from './Reticle'
import { ImageIcon, RefreshIcon, CameraIcon, ArrowLeftIcon, ChevronDownIcon } from '../ui/Icons'

// Photos are sampled a bit tighter than the live camera: no sensor noise to
// average away, and people tend to aim at small details.
const PHOTO_SPOT_SCALE = 0.6

export default function ImageUploadView({ onSave, onBack, onColorChange }) {
  const { settings } = useSettings()
  const engine = useMemo(() => engineOptions(settings), [settings])
  const [imageSrc, setImageSrc] = useState(null)
  const [raw, setRaw] = useState(null) // last sampled pixel; the name is derived from it
  const [aim, setAim] = useState(null) // { x, y, spotPx } in container pixels
  const [dragging, setDragging] = useState(false)
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [sampler] = useState(createSampler)
  const imgRef = useRef(null)
  const stageRef = useRef(null)
  const pointerDown = useRef(false)

  // Re-derived when the vision profile changes, so warnings stay current.
  const color = useMemo(() => (raw ? identify(raw.r, raw.g, raw.b, engine) : null), [raw, engine])

  useEffect(() => { onColorChange?.(color) }, [color, onColorChange])

  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      setImageSrc(e.target.result)
      setRaw(null)
      setAim(null)
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    function onPaste(e) {
      const item = Array.from(e.clipboardData?.items || []).find(i => i.type.startsWith('image/'))
      if (item) loadFile(item.getAsFile())
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [])

  const sampleAt = useCallback((clientX, clientY) => {
    const img = imgRef.current
    const stage = stageRef.current
    if (!img || !stage || !img.naturalWidth) return
    // The <img> box is exactly the displayed picture (it keeps its aspect
    // ratio), so only points inside it count.
    const r = img.getBoundingClientRect()
    const u = (clientX - r.left) / r.width
    const v = (clientY - r.top) / r.height
    if (u < 0 || v < 0 || u > 1 || v > 1) return
    const scale = r.width / img.naturalWidth
    const size = Math.min(img.naturalWidth, img.naturalHeight) * SPOT_SIZES[settings.spot || 'medium'] * PHOTO_SPOT_SCALE
    const px = sampler(img, u * img.naturalWidth, v * img.naturalHeight, size)
    const s = stage.getBoundingClientRect()
    setAim({ x: clientX - s.left, y: clientY - s.top, spotPx: Math.max(10, size * scale) })
    setRaw({ r: px.r, g: px.g, b: px.b })
  }, [sampler, settings.spot])

  function onPointerDown(e) {
    pointerDown.current = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    sampleAt(e.clientX, e.clientY)
  }
  function onPointerMove(e) {
    if (pointerDown.current) sampleAt(e.clientX, e.clientY)
  }
  function onPointerUp() {
    pointerDown.current = false
  }

  if (!imageSrc) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 gap-6 bg-dark-bg">
        <div
          className={`w-full max-w-md border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ease-soft ${dragging ? 'border-white/60 bg-white/[0.06] scale-[1.01]' : 'border-white/[0.12] hover:border-white/25'}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files[0]) }}
        >
          <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center transition-transform duration-300 ease-spring ${dragging ? 'scale-110' : ''}`}>
            <ImageIcon size={28} className="text-white/70" strokeWidth={1.6} />
          </div>
          <p className="text-white font-semibold mb-1">Drop a photo here</p>
          <p className="text-gray-500 text-sm mb-6 font-light">or paste one (Ctrl+V). It never leaves your device.</p>
          <label className="group/file inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-semibold text-sm cursor-pointer hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-200 ease-spring active:scale-[0.97] select-none">
            <input type="file" accept="image/*" className="hidden" onChange={e => loadFile(e.target.files[0])} />
            <ImageIcon size={16} className="transition-transform duration-300 ease-spring group-hover/file:scale-110" />
            Choose a photo
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
    <div ref={stageRef} className="relative w-full h-full bg-black overflow-hidden select-none">
      <div
        className="absolute inset-0 flex items-center justify-center cursor-crosshair touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Your photo"
          className="max-w-full max-h-full object-contain"
          draggable={false}
        />
      </div>

      {aim && (
        <div
          className="absolute pointer-events-none"
          style={{ left: aim.x, top: aim.y, transform: 'translate(-50%, -50%)' }}
        >
          <Reticle size={84} spot={aim.spotPx} />
        </div>
      )}

      {!aim && (
        <div className="absolute inset-x-0 top-20 flex justify-center pointer-events-none">
          <span className="px-3.5 py-1.5 rounded-full bg-black/55 backdrop-blur-md text-white/85 text-xs font-medium border border-white/10">
            Tap or drag across the photo
          </span>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 via-black/20 to-transparent">
        <span className="font-bold text-white text-sm tracking-tight"><span className="font-normal">What</span>Color</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setImageSrc(null); setRaw(null); setAim(null) }}
            className="group/new w-10 h-10 rounded-full flex items-center justify-center bg-black/40 text-white/70 border border-white/[0.08] hover:bg-black/60 hover:text-white transition-all duration-200 ease-spring active:scale-90 backdrop-blur-md"
            aria-label="Choose another photo"
            title="Choose another photo"
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

      {/* Mobile color panel (desktop shows it in the sidebar) */}
      <div className="absolute bottom-0 left-0 right-0 lg:hidden pointer-events-none">
        <div
          className="px-3 pb-3 transition-transform duration-300 ease-soft pointer-events-auto"
          style={{ transform: panelCollapsed ? 'translateY(120%)' : 'translateY(0)' }}
        >
          <div
            className="p-4 pt-2 backdrop-blur-xl rounded-2xl border border-white/[0.09] transition-[background] duration-500 ease-out raised-dark max-h-[55vh] overflow-y-auto"
            style={{
              background: color
                ? `linear-gradient(180deg, ${color.hex}1f 0%, rgba(17,17,17,0.94) 60%)`
                : 'rgba(17,17,17,0.92)',
            }}
          >
            <button
              onClick={() => setPanelCollapsed(true)}
              aria-label="Hide color panel"
              className="w-full flex flex-col items-center gap-1 pb-2 -mt-1 group/grab active:scale-[0.98] transition-transform"
            >
              <span className="w-9 h-1 rounded-full bg-white/25 group-hover/grab:bg-white/40 transition-colors" />
              <ChevronDownIcon size={14} className="text-white/30 group-hover/grab:text-white/55 transition-colors" />
            </button>

            {!color ? (
              <div className="flex items-center gap-3 py-1">
                <div className="w-[52px] h-[52px] rounded-[15px] shrink-0 bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                  <ImageIcon size={22} className="text-white/40" />
                </div>
                <div>
                  <p className="text-white/70 text-[15px] font-medium leading-tight">Tap anywhere on the photo</p>
                  <p className="text-white/35 text-[12px] font-light mt-0.5">Or drag to scan across it</p>
                </div>
              </div>
            ) : (
              <ColorInfoPanel color={color} onSave={onSave} dark />
            )}
          </div>
        </div>

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
              <span className="text-[13px] text-white/90 font-medium">{color.name}</span>
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
