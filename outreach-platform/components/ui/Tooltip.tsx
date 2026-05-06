'use client'

interface Props {
  hebrew: string
  children: React.ReactNode
  dir?: 'top' | 'bottom'
}

export function Tooltip({ hebrew, children, dir = 'top' }: Props) {
  return (
    <span className="relative group/tip inline-flex items-center">
      {children}
      <span
        className={`
          pointer-events-none absolute left-1/2 -translate-x-1/2 z-50
          px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap
          opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150
          ${dir === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}
        `}
        dir="rtl"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {hebrew}
        <span className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${dir === 'top' ? 'top-full border-t-gray-900' : 'bottom-full border-b-gray-900'}`} />
      </span>
    </span>
  )
}
