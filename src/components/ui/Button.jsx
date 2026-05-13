export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-white text-black hover:bg-gray-100 focus:ring-white',
    secondary: 'bg-dark-surface text-white border border-dark-border hover:bg-[#1e1e1e] focus:ring-gray-500',
    ghost: 'text-gray-400 hover:text-white hover:bg-dark-surface focus:ring-gray-500',
    danger: 'bg-brand-red text-white hover:bg-red-700 focus:ring-brand-red',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-5 py-2.5 text-sm min-h-[44px]',
    lg: 'px-7 py-3.5 text-base min-h-[52px]',
  }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
