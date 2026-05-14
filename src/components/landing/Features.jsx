const FEATURES = [
  { icon: '🎯', title: 'Real-Time Camera Detection', desc: 'Live color identification as you move your camera. No tapping required.' },
  { icon: '📸', title: 'Image Upload', desc: 'Upload any photo and tap anywhere to identify colors.' },
  { icon: '🧠', title: 'Colorblind-Aware Warnings', desc: 'Set your type once — get heads-up warnings when a color is in your confusion zone.' },
  { icon: '⚖️', title: 'Side-by-Side Comparison', desc: "Compare two colors and see if you'd likely confuse them." },
  { icon: '📋', title: 'Color History', desc: 'Save colors, add labels, and export your palette.' },
  { icon: '🌓', title: 'Light & Dark Mode', desc: 'High contrast UI in both modes. An accessibility tool that\'s actually accessible.' },
  { icon: '🔒', title: '100% Private', desc: "All processing is on-device. Your camera feed never leaves your phone." },
  { icon: '💰', title: 'Free Forever', desc: 'No paywall, no ads, no account required.' },
]

export default function Features() {
  return (
    <section className="px-6 py-16 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Everything you need</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map(({ icon, title, desc }) => (
          <div key={title} className="flex flex-col gap-2 p-5 bg-white border border-light-border rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
