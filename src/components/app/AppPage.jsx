import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useColorHistory } from '../../hooks/useColorHistory'
import CameraView from './CameraView'
import ImageUploadView from './ImageUploadView'
import CompareMode from './CompareMode'
import ColorHistory from './ColorHistory'
import ColorInfoPanel from './ColorInfoPanel'
import { CompareIcon, HistoryIcon } from '../ui/Icons'

export default function AppPage() {
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'upload' ? 'upload'
    : searchParams.get('mode') === 'compare' ? 'compare'
    : 'camera'

  const [mode, setMode] = useState(initialMode)
  const [currentColor, setCurrentColor] = useState(null)
  const { history, save, remove, updateLabel, clearAll, exportJson } = useColorHistory()

  return (
    <div className="fixed inset-0 bg-black flex flex-col lg:flex-row overflow-hidden">
      {/* Main area */}
      <div className="flex-1 relative min-h-0">
        {mode === 'camera' && (
          <CameraView
            onColorChange={setCurrentColor}
            onSave={color => save(color)}
            onSwitchToUpload={() => setMode('upload')}
            onSwitchToCompare={() => setMode('compare')}
            onSwitchToHistory={() => setMode('history')}
          />
        )}
        {mode === 'upload' && (
          <ImageUploadView
            onSave={color => save(color)}
            onBack={() => setMode('camera')}
            onColorChange={setCurrentColor}
          />
        )}
        {(mode === 'compare' || mode === 'history') && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A] text-white/20 text-sm select-none font-light">
            Camera paused
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-[360px] bg-[#111] border-l border-white/[0.06] flex-col overflow-hidden">
        {/* Pill tab strip */}
        {(mode === 'camera' || mode === 'upload') && (
          <div className="px-4 pt-4 pb-0 shrink-0">
            <div className="flex gap-1 p-1 rounded-2xl glass-track-dark">
              <button
                onClick={() => setMode('compare')}
                className="group/tab flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white/45 hover:text-white hover:bg-white/[0.07] transition-all duration-200 ease-spring active:scale-[0.97]"
              >
                <CompareIcon size={13} className="transition-transform duration-300 ease-spring group-hover/tab:scale-110" /> Compare
              </button>
              <button
                onClick={() => setMode('history')}
                className="group/tab flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white/45 hover:text-white hover:bg-white/[0.07] transition-all duration-200 ease-spring active:scale-[0.97]"
              >
                <HistoryIcon size={13} className="transition-transform duration-300 ease-spring group-hover/tab:scale-110" /> History {history.length > 0 && <span className="ml-0.5 bg-white/12 text-white/80 px-1.5 py-0.5 rounded-full text-[10px] tabular-nums">{history.length}</span>}
              </button>
            </div>
          </div>
        )}

        {(mode === 'camera' || mode === 'upload') ? (
          <div className="flex-1 overflow-y-auto p-4">
            <ColorInfoPanel color={currentColor} onSave={color => save(color)} dark />
          </div>
        ) : mode === 'compare' ? (
          <div className="flex-1 overflow-hidden">
            <CompareMode currentColor={currentColor} history={history} onBack={() => setMode('camera')} />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <ColorHistory history={history} onRemove={remove} onLabelChange={updateLabel} onClearAll={clearAll} onExport={exportJson} onBack={() => setMode('camera')} />
          </div>
        )}
      </div>

      {/* Mobile compare/history overlay */}
      {(mode === 'compare' || mode === 'history') && (
        <div className="lg:hidden absolute inset-0 bg-[#111] z-20 overflow-hidden flex flex-col">
          {mode === 'compare' ? (
            <CompareMode currentColor={currentColor} history={history} onBack={() => setMode('camera')} />
          ) : (
            <ColorHistory history={history} onRemove={remove} onLabelChange={updateLabel} onClearAll={clearAll} onExport={exportJson} onBack={() => setMode('camera')} />
          )}
        </div>
      )}
    </div>
  )
}
