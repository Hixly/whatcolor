import { CheckIcon, DownloadIcon, LockIcon, SparkleIcon } from '../ui/Icons'

export const TRUST_PILLS = [
  { label: 'Works offline', Icon: DownloadIcon, accent: '#0A84FF' },
  { label: 'No account', Icon: CheckIcon, accent: '#30D158' },
  { label: 'Free forever', Icon: SparkleIcon, accent: '#FFD60A' },
  { label: 'On-device', Icon: LockIcon, accent: '#BF5AF2' },
]

export default function TrustPills({ className = '', size = 'default' }) {
  const compact = size === 'compact'

  return (
    <ul
      className={`flex flex-wrap items-center justify-center gap-2.5 list-none m-0 p-0 ${className}`}
      aria-label="Product guarantees"
    >
      {TRUST_PILLS.map(({ label, Icon, accent }) => (
        <li key={label}>
          <span
            className={`glass-pill group ${compact ? 'glass-pill-compact' : ''}`}
            style={{ '--pill-accent': accent }}
          >
            <span
              className="glass-pill-icon"
              style={{ color: accent, backgroundColor: `${accent}18` }}
            >
              <Icon size={compact ? 11 : 12} strokeWidth={2} />
            </span>
            {label}
          </span>
        </li>
      ))}
    </ul>
  )
}
