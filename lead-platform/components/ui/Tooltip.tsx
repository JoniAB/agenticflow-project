import { cn } from '@/lib/utils'

export function Tooltip({
  children,
  text,
  className,
}: {
  children: React.ReactNode
  text: string
  className?: string
}) {
  return (
    <span className={cn('relative group/tip inline-flex', className)}>
      {children}
      <span className="
        pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5
        px-2 py-0.5 rounded-md bg-gray-900 text-white text-[11px] font-medium
        whitespace-nowrap opacity-0 group-hover/tip:opacity-100
        transition-opacity duration-150 z-50
      ">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  )
}
