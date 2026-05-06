import { cn } from '@/lib/utils'

interface ScorePillProps {
  score: number
}

export function ScorePill({ score }: ScorePillProps) {
  const classed =
    score <= 1
      ? 'bg-emerald-50 text-emerald-700'
      : score <= 2
      ? 'bg-green-50 text-green-700'
      : score <= 3
      ? 'bg-yellow-50 text-yellow-700'
      : 'bg-red-50 text-red-700'

  return (
    <span className={cn('inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums', classed)}>
      {score}
    </span>
  )
}
