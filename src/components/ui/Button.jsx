export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'group/btn inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 ease-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.96] active:duration-75 select-none'
  const variants = {
    primary:   'bg-[#111] text-white hover:bg-[#000] focus-visible:ring-[#111] raised-dark hover:-translate-y-0.5',
    secondary: 'bg-transparent text-[#111] border border-[#DDDDDD] hover:bg-[#F5F5F5] hover:border-[#BBBBBB] focus-visible:ring-gray-400',
    white:     'bg-white text-[#111] border border-[#E8E8E8] hover:border-[#D8D8D8] focus-visible:ring-gray-300 raised-light hover:-translate-y-0.5',
    ghost:     'text-gray-500 hover:text-[#111] hover:bg-[#F5F5F5] focus-visible:ring-gray-300',
    danger:    'bg-brand-red text-white hover:brightness-110 focus-visible:ring-brand-red raised-dark hover:-translate-y-0.5',
    dark:      'bg-dark-surface text-white border border-white/[0.08] hover:bg-[#1c1c1c] hover:border-white/[0.14] focus-visible:ring-white/30 raised-dark',
  }
  const sizes = {
    xs: 'px-3 py-1.5 text-xs min-h-[30px]',
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-2.5 text-sm min-h-[44px]',
    lg: 'px-8 py-3.5 text-base min-h-[52px]',
  }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
