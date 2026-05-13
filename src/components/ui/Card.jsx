export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-dark-surface border border-dark-border rounded-2xl p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
