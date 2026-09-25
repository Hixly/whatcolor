import { Link } from 'react-router-dom'
import { useSettings } from '../../contexts/SettingsContext'
import { CVD_LABELS } from '../../engine/cvd'
import { ChevronDownIcon, ArrowLeftIcon } from '../ui/Icons'
import { SOCIALS } from '../../socials'

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

function Select({ id, value, onChange, children }) {
  return (
    <div className="relative inline-block group/sel">
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-dark-surface border border-white/[0.08] rounded-xl pl-4 pr-10 py-2.5 text-white text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 hover:border-white/[0.16] transition-colors duration-200 appearance-none cursor-pointer raised-dark"
      >
        {children}
      </select>
      <ChevronDownIcon
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-transform duration-300 ease-spring group-focus-within/sel:rotate-180 group-focus-within/sel:text-white/70"
      />
    </div>
  )
}

export default function SettingsPage() {
  const { settings, updateSetting } = useSettings()

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/app"
            aria-label="Back to app"
            className="group/back w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200 ease-spring active:scale-90"
          >
            <ArrowLeftIcon size={18} className="transition-transform duration-300 ease-spring group-hover/back:-translate-x-0.5" />
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        </div>

        <div className="flex flex-col gap-4">
          {/* Color Vision Profile */}
          <Section title="Your color vision">
            <div className="flex flex-col gap-2">
              <label htmlFor="cvd-type" className="text-sm text-gray-400">Type</label>
              <Select id="cvd-type" value={settings.colorblindProfile} onChange={v => updateSetting('colorblindProfile', v)}>
                {Object.entries(CVD_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
              <p className="text-xs text-gray-500 leading-relaxed">
                WhatColor simulates your type to warn you when a color can pass for a different one, and to tell you
                whether two colors will look the same to you. Red-green color blindness affects about 1 in 12 men;
                deutan is the most common kind.
              </p>
            </div>
            {['protanopia', 'deuteranopia', 'tritanopia'].includes(settings.colorblindProfile) && (
              <Row label="How strong" description="Most people have the milder form. Pick strong if reds and greens are very hard for you.">
                <Select value={settings.cvdStrength} onChange={v => updateSetting('cvdStrength', v)}>
                  <option value="strong">Strong</option>
                  <option value="mild">Mild</option>
                </Select>
              </Row>
            )}
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
            <Row label="Sample spot" description="The circle in the middle of the reticle. Bigger is steadier on textured things like fabric; smaller is better for tiny details.">
              <Select value={settings.spot} onChange={v => updateSetting('spot', v)}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </Select>
            </Row>
            <p className="text-xs text-gray-500 leading-relaxed">
              Warm bulbs and shade shift what a camera sees. If colors look off, aim at plain white paper and tap
              Set white in the camera to correct for the light you are in.
            </p>
          </Section>

          {/* Privacy */}
          <Section title="Privacy">
            <p className="text-sm text-gray-400 leading-relaxed">
              WhatColor processes everything on your device. No images, camera frames, or color data are ever sent to a server. Your color history lives only in your browser's localStorage and never leaves your device.
            </p>
          </Section>

          {/* About */}
          <Section title="About">
            <p className="text-sm text-gray-500">WhatColor. See more. Know more.</p>
            <p className="text-xs text-gray-600">Built by a colorblind developer, for colorblind people.</p>

            {/* Social */}
            <div className="flex items-center gap-2 pt-1">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/[0.08] text-white/55 hover:text-white hover:bg-white/[0.12] transition-all duration-200 ease-spring active:scale-90"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>

            <Link to="/" className="group/home inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
              <ArrowLeftIcon size={13} className="transition-transform duration-300 ease-spring group-hover/home:-translate-x-0.5" />
              Back to home
            </Link>
          </Section>
        </div>
      </div>
    </div>
  )
}
