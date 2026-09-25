import { createContext, useContext, useState, useEffect } from 'react'

const DEFAULTS = {
  colorblindProfile: 'none',
  cvdStrength: 'strong', // 'strong' = dichromat model, 'mild' = anomalous trichromat
  colorFormat: 'hex',
  facingMode: 'environment',
  spot: 'medium',
}

const PROFILES = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia']
const SPOTS = ['small', 'medium', 'large']

// Older builds stored a pixel count and a "custom" profile; map them forward.
function migrate(stored) {
  const next = { ...DEFAULTS, ...stored }
  if (!PROFILES.includes(next.colorblindProfile)) next.colorblindProfile = 'none'
  if (!SPOTS.includes(next.spot)) {
    next.spot = stored.samplingSize === 1 ? 'small' : stored.samplingSize === 5 ? 'large' : 'medium'
  }
  delete next.samplingSize
  delete next.theme
  return next
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('wc_settings')
      return stored ? migrate(JSON.parse(stored)) : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('wc_settings', JSON.stringify(settings))
    } catch {
      // Private mode or full storage: settings just won't persist.
    }
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

// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs with its provider
export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
