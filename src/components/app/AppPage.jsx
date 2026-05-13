import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useColorHistory } from '../../hooks/useColorHistory'
import CameraView from './CameraView'
import ImageUploadView from './ImageUploadView'
import CompareMode from './CompareMode'
import ColorHistory from './ColorHistory'
import ColorInfoPanel from './ColorInfoPanel'

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
      {/* Main camera/upload area */}
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
          />
        )}
        {(mode === 'compare' || mode === 'history') && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-bg text-gray-600 text-sm select-none">
            Camera paused — switch back to use live detection
          </div>
        )}
      </div>

      {/* Desktop sidebar — only visible on lg+ */}
      <div className="hidden lg:flex w-[380px] bg-dark-surface border-l border-dark-border flex-col overflow-hidden">
        {mode === 'camera' || mode === 'upload' ? (
          <div className="flex-1 overflow-y-auto p-5">
            {/* Mode toggle buttons */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setMode('compare')}
                className="flex-1 py-2 rounded-xl bg-dark-bg border border-dark-border text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
              >
                ⚖️ Compare
              </button>
              <button
                onClick={() => setMode('history')}
                className="flex-1 py-2 rounded-xl bg-dark-bg border border-dark-border text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
              >
                🕐 History {history.length > 0 && `(${history.length})`}
              </button>
            </div>
            <ColorInfoPanel color={currentColor} onSave={color => save(color)} />
          </div>
        ) : mode === 'compare' ? (
          <div className="flex-1 overflow-hidden">
            <CompareMode
              currentColor={currentColor}
              history={history}
              onBack={() => setMode('camera')}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <ColorHistory
              history={history}
              onRemove={remove}
              onLabelChange={updateLabel}
              onClearAll={clearAll}
              onExport={exportJson}
              onBack={() => setMode('camera')}
            />
          </div>
        )}
      </div>

      {/* Mobile compare/history — full-screen overlay */}
      {(mode === 'compare' || mode === 'history') && (
        <div className="lg:hidden absolute inset-0 bg-dark-bg z-20 overflow-hidden flex flex-col">
          {mode === 'compare' ? (
            <CompareMode
              currentColor={currentColor}
              history={history}
              onBack={() => setMode('camera')}
            />
          ) : (
            <ColorHistory
              history={history}
              onRemove={remove}
              onLabelChange={updateLabel}
              onClearAll={clearAll}
              onExport={exportJson}
              onBack={() => setMode('camera')}
            />
          )}
        </div>
      )}
    </div>
  )
}
