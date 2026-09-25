import { createContext, useContext, useState, useEffect } from 'react'

const DEFAULTS = {
  colorblindProfile: 'none',
  colorFormat: 'hex',
  facingMode: 'environment',
  samplingSize: 3,
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('wc_settings')
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  useEffect(() => {
    localStorage.setItem('wc_settings', JSON.stringify(settings))
  }, [settings])

  function updateSetting(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
