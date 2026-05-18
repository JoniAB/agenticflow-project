import { CompanyStatus } from '@/lib/types'
import { STATUS_CONFIG } from '@/lib/status-config'
import { cn } from '@/lib/utils'

export function StatusDot({ status }: { status: CompanyStatus }) {
  const config = STATUS_CONFIG[status]
  if (!config) return null
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold leading-none whitespace-nowrap',
      config.bg, config.text,
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      {config.label}
    </span>
  )
}
