export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-white' : 'bg-dark-border'}`} />
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-black rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`} />
      </div>
      {label && <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>}
    </label>
  )
}
