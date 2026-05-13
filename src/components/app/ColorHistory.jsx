import { useState } from 'react'
import Button from '../ui/Button'

function HistoryEntry({ entry, onRemove, onLabelChange }) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(entry.label || '')
  const [expanded, setExpanded] = useState(false)

  function saveLabel() {
    onLabelChange(entry.id, label)
    setEditing(false)
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-dark-surface transition-colors group">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-10 h-10 rounded-xl border border-dark-border shrink-0 hover:scale-110 transition-transform"
        style={{ backgroundColor: entry.hex }}
        aria-label={`Expand ${entry.name}`}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate">{entry.name}</p>
        <p className="font-mono text-xs text-gray-500">{entry.hex}</p>
        {editing ? (
          <div className="flex gap-2 mt-1">
            <input
              autoFocus
              className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-gray-500"
              value={label}
              onChange={e => setLabel(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') saveLabel()
                if (e.key === 'Escape') setEditing(false)
              }}
              placeholder="Add a label…"
            />
            <button onClick={saveLabel} className="text-xs text-green-400 hover:text-green-300 transition-colors">✓</button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-600 hover:text-gray-400 mt-0.5 transition-colors"
          >
            {entry.label || '+ Add label'}
          </button>
        )}
        {expanded && (
          <div className="mt-2 flex flex-col gap-0.5">
            <span className="font-mono text-xs text-gray-500">{entry.rgb}</span>
            <span className="font-mono text-xs text-gray-500">{entry.hsl}</span>
            <span className="text-xs text-gray-600">{new Date(entry.savedAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(entry.id)}
        className="p-1.5 text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
        aria-label={`Remove ${entry.name}`}
      >
        ✕
      </button>
    </div>
  )
}

export default function ColorHistory({ history, onRemove, onLabelChange, onClearAll, onExport, onBack }) {
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border shrink-0">
        <h2 className="font-bold text-white text-lg">Color History</h2>
        <button onClick={onBack} className="text-gray-500 hover:text-white text-sm transition-colors">← Back</button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <span className="text-4xl">🎨</span>
            <p className="text-gray-500 text-sm">No saved colors yet. Hit the save button while detecting a color.</p>
          </div>
        ) : (
          history.map(entry => (
            <HistoryEntry
              key={entry.id}
              entry={entry}
              onRemove={onRemove}
              onLabelChange={onLabelChange}
            />
          ))
        )}
      </div>

      {history.length > 0 && (
        <div className="flex gap-2 px-5 py-4 border-t border-dark-border shrink-0 flex-wrap">
          <Button variant="secondary" size="sm" onClick={onExport} className="flex-1">
            Export JSON
          </Button>
          {confirmClear ? (
            <>
              <Button variant="danger" size="sm" onClick={() => { onClearAll(); setConfirmClear(false) }}>
                Confirm Clear
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)}>
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
