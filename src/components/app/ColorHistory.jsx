import { useState } from 'react'
import { ArrowLeftIcon, DownloadIcon, PaletteIcon, XIcon, CheckIcon } from '../ui/Icons'

function HistoryEntry({ entry, onRemove, onLabelChange }) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(entry.label || '')
  const [expanded, setExpanded] = useState(false)

  function saveLabel() {
    onLabelChange(entry.id, label)
    setEditing(false)
  }

  return (
    <div className="flex items-start gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 transition-colors group">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-10 h-10 rounded-xl border border-white/10 shrink-0 hover:scale-110 transition-transform"
        style={{ backgroundColor: entry.hex }}
        aria-label={`Expand ${entry.name}`}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate">{entry.name}</p>
        <p className="font-mono text-[11px] text-white/30">{entry.hex}</p>
        {editing ? (
          <div className="flex gap-2 mt-1.5">
            <input
              autoFocus
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-2.5 py-1 text-xs text-white focus:outline-none focus:border-white/30"
              value={label}
              onChange={e => setLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveLabel(); if (e.key === 'Escape') setEditing(false) }}
              placeholder="Add a label…"
            />
            <button onClick={saveLabel} className="text-brand-green">
              <CheckIcon size={13} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-[11px] text-white/20 hover:text-white/50 mt-0.5 transition-colors">
            {entry.label || '+ label'}
          </button>
        )}
        {expanded && (
          <div className="mt-2 flex flex-col gap-0.5">
            <span className="font-mono text-[11px] text-white/30">{entry.rgb}</span>
            <span className="font-mono text-[11px] text-white/30">{entry.hsl}</span>
            <span className="text-[11px] text-white/20">{new Date(entry.savedAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(entry.id)}
        className="p-1.5 text-white/10 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100 shrink-0"
        aria-label={`Remove ${entry.name}`}
      >
        <XIcon size={13} />
      </button>
    </div>
  )
}

export default function ColorHistory({ history, onRemove, onLabelChange, onClearAll, onExport, onBack }) {
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] shrink-0">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
          <ArrowLeftIcon size={15} className="text-white/60" />
        </button>
        <h2 className="font-bold text-white flex-1">Color History</h2>
        {history.length > 0 && (
          <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">{history.length}</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <PaletteIcon size={22} className="text-white/20" />
            </div>
            <p className="text-white/30 text-sm font-light max-w-[180px]">
              No saved colors yet. Tap Save while detecting a color.
            </p>
          </div>
        ) : (
          history.map(entry => (
            <HistoryEntry key={entry.id} entry={entry} onRemove={onRemove} onLabelChange={onLabelChange} />
          ))
        )}
      </div>

      {history.length > 0 && (
        <div className="flex gap-2 px-4 py-4 border-t border-white/[0.06] shrink-0">
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-white/60 text-xs font-semibold rounded-full hover:bg-white/10 transition-all"
          >
            <DownloadIcon size={13} /> Export
          </button>
          {confirmClear ? (
            <>
              <button
                onClick={() => { onClearAll(); setConfirmClear(false) }}
                className="flex-1 py-2 bg-brand-red/20 text-brand-red text-xs font-semibold rounded-full hover:bg-brand-red/30 transition-all"
              >
                Confirm Clear
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-4 py-2 text-white/30 text-xs font-semibold hover:text-white/60 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="ml-auto px-4 py-2 text-white/20 text-xs font-semibold hover:text-white/50 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  )
}
