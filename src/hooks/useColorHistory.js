import { useState, useCallback } from 'react'

const STORAGE_KEY = 'wc_history'
const MAX_ENTRIES = 200

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useColorHistory() {
  const [history, setHistory] = useState(load)

  const save = useCallback((color, label = '') => {
    setHistory(prev => {
      const entry = { ...color, label, savedAt: new Date().toISOString(), id: Date.now() }
      const next = [entry, ...prev].slice(0, MAX_ENTRIES)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const remove = useCallback((id) => {
    setHistory(prev => {
      const next = prev.filter(e => e.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const updateLabel = useCallback((id, label) => {
    setHistory(prev => {
      const next = prev.map(e => e.id === id ? { ...e, label } : e)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }, [])

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'whatcolor-history.json'
    a.click()
  }, [history])

  return { history, save, remove, updateLabel, clearAll, exportJson }
}
