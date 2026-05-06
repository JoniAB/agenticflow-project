interface ScoreBarProps {
  score: number
  max?: number
}

export function ScoreBar({ score, max = 10 }: ScoreBarProps) {
  const color =
    score <= 2 ? '#22C55E' :
    score <= 4 ? '#F59E0B' :
    score <= 6 ? '#F97316' :
                 '#EF4444'

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-[3px]">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 3,
              borderRadius: 2,
              backgroundColor: i < score ? color : '#E5E7EB',
            }}
          />
        ))}
      </div>
      <span className="text-[12px] font-semibold tabular-nums" style={{ color }}>
        {score}
      </span>
    </div>
  )
}
