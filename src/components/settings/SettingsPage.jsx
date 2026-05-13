import { Link } from 'react-router-dom'
import { useSettings } from '../../contexts/SettingsContext'
import { PROFILE_LABELS } from '../../utils/confusionPairs'

function Section({ title, children }) {
  return (
    <div className="border border-dark-border rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-dark-border bg-dark-surface">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="bg-dark-bg p-5 flex flex-col gap-4">{children}</div>
    </div>
  )
}

function Row({ label, description, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="text-sm font-medium text-white">{label}</span>
        {description && <span className="text-xs text-gray-500">{description}</span>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gray-500 appearance-none cursor-pointer"
    >
      {children}
    </select>
  )
}

export default function SettingsPage() {
  const { settings, updateSetting } = useSettings()

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/app" className="text-gray-500 hover:text-white transition-colors text-xl leading-none">←</Link>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>

        <div className="flex flex-col gap-4">
          {/* Color Vision Profile */}
          <Section title="Color Vision Profile">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Your color vision type</label>
              <Select value={settings.colorblindProfile} onChange={v => updateSetting('colorblindProfile', v)}>
                {Object.entries(PROFILE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
              <p className="text-xs text-gray-600">
                Controls the confusion-pair warnings shown when a detected color is commonly mistaken for another with your type of color vision.
              </p>
            </div>
          </Section>

          {/* Appearance */}
          <Section title="Appearance">
            <Row label="Theme" description="Controls the UI color scheme">
              <Select value={settings.theme} onChange={v => updateSetting('theme', v)}>
                <option value="dark">Dark (default)</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </Select>
            </Row>
          </Section>

          {/* Color Format */}
          <Section title="Color Format">
            <Row label="Primary format" description="Which format is shown first in the panel">
              <Select value={settings.colorFormat} onChange={v => updateSetting('colorFormat', v)}>
                <option value="hex">HEX</option>
                <option value="rgb">RGB</option>
                <option value="hsl">HSL</option>
              </Select>
            </Row>
          </Section>

          {/* Camera */}
          <Section title="Camera">
            <Row label="Preferred camera" description="Which camera to open by default">
              <Select value={settings.facingMode} onChange={v => updateSetting('facingMode', v)}>
                <option value="environment">Rear camera</option>
                <option value="user">Front camera</option>
              </Select>
            </Row>
            <Row label="Sampling area" description="Larger areas reduce noise but are less precise">
              <Select
                value={String(settings.samplingSize)}
                onChange={v => updateSetting('samplingSize', Number(v))}
              >
                <option value="1">Single pixel</option>
                <option value="3">3×3 average</option>
                <option value="5">5×5 average</option>
              </Select>
            </Row>
          </Section>

          {/* Privacy */}
          <Section title="Privacy">
            <p className="text-sm text-gray-400 leading-relaxed">
              WhatColor processes everything on your device. No images, camera frames, or color data are ever sent to a server. Your color history lives only in your browser's localStorage and never leaves your device.
            </p>
          </Section>

          {/* About */}
          <Section title="About">
            <p className="text-sm text-gray-500">WhatColor.io — See More. Know More.</p>
            <p className="text-xs text-gray-600">Built by a colorblind developer, for colorblind people.</p>
            <Link to="/" className="text-xs text-gray-500 hover:text-white transition-colors">← Back to home</Link>
          </Section>
        </div>
      </div>
    </div>
  )
}
