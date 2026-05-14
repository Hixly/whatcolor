export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97]'
  const variants = {
    primary:   'bg-[#111] text-white hover:bg-[#333] focus:ring-[#111] shadow-sm hover:shadow-md hover:-translate-y-px',
    secondary: 'bg-transparent text-[#111] border border-[#DDDDD] hover:bg-[#F5F5F5] hover:border-[#BBBBBB] focus:ring-gray-400',
    white:     'bg-white text-[#111] border border-[#E5E5E5] hover:bg-[#F8F8F8] focus:ring-gray-300 shadow-sm hover:shadow-md hover:-translate-y-px',
    ghost:     'text-gray-500 hover:text-[#111] hover:bg-[#F5F5F5] focus:ring-gray-300',
    danger:    'bg-brand-red text-white hover:brightness-110 focus:ring-brand-red shadow-sm hover:shadow-md hover:-translate-y-px',
    dark:      'bg-dark-surface text-white border border-dark-border hover:bg-[#1c1c1c] focus:ring-gray-600',
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
