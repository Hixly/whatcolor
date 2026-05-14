const STEPS = [
  {
    icon: '🎯',
    step: '01',
    title: 'Point',
    desc: 'Open your camera and aim the crosshair at any color you want to identify.',
  },
  {
    icon: '🔬',
    step: '02',
    title: 'Detect',
    desc: 'The crosshair samples the color in real-time — no button to press, no waiting.',
  },
  {
    icon: '💡',
    step: '03',
    title: 'Know',
    desc: 'Get the plain-language name, HEX/RGB/HSL values, and a heads-up if your type might confuse it with another color.',
  },
]

export default function HowItWorks() {
  return (
    <section className="px-6 py-16 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">How it works</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {STEPS.map(({ icon, step, title, desc }) => (
          <div key={step} className="flex flex-col gap-3 p-6 bg-white border border-light-border rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{icon}</span>
              <span className="text-xs text-gray-400 font-mono">{step}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
