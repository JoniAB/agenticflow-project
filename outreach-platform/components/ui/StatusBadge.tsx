import { LeadStatus } from '@/lib/types'
import { STATUS_CONFIG } from '@/lib/board-config'
import { STATUS_HEBREW } from '@/lib/hebrew'
import { Tooltip } from './Tooltip'
import { cn } from '@/lib/utils'

export function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = STATUS_CONFIG[status]
  const hebrew = STATUS_HEBREW[status]
  return (
    <Tooltip hebrew={hebrew} dir="top">
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium cursor-default', cfg.color, cfg.bg)}>
        <span className={cn('w-1.5 h-1.5 rounded-full', cfg.color.replace('text-', 'bg-'))} />
        {cfg.label}
      </span>
    </Tooltip>
  )
}
