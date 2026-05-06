import { cn } from '@/lib/utils'

const SOURCE_MAP: Record<string, { label: string; color: string }> = {
  linkedin: { label: 'LinkedIn', color: 'bg-blue-50 text-blue-700' },
  google_maps: { label: 'Maps', color: 'bg-green-50 text-green-700' },
  other: { label: 'Other', color: 'bg-slate-100 text-slate-600' },
}

export function SourceBadge({ source }: { source: string }) {
  const config = SOURCE_MAP[source] ?? SOURCE_MAP.other
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', config.color)}>
      {config.label}
    </span>
  )
}
