import { cn } from '@/lib/utils'

export function IcpScore({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-300 text-sm">—</span>

  const color =
    score >= 70 ? 'text-green-600' :
    score >= 40 ? 'text-yellow-600' :
    'text-red-600'

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('text-sm font-semibold tabular-nums', color)}>{score}</span>
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500')}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
