export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div
          className={`w-12 h-7 rounded-full transition-colors duration-300 ease-soft track-dark peer-focus-visible:ring-2 peer-focus-visible:ring-brand-green/50 ${
            checked ? 'bg-brand-green' : 'bg-dark-border'
          }`}
        />
        <div
          className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-spring ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </div>
      {label && <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>}
    </label>
  )
}
