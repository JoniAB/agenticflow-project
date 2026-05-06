interface BoardHeaderProps {
  title: string
  description: string
  count: number
  icon: React.ReactNode
  accentColor: string
}

export function BoardHeader({ title, description, count, icon, accentColor }: BoardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-8 py-6 border-b border-[#E4E6EF] bg-white">
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ backgroundColor: accentColor + '18' }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[#1A1D2E]">{title}</h1>
          <p className="text-sm text-[#9CA0B8] mt-0.5">{description}</p>
        </div>
      </div>
      <div
        className="flex items-center justify-center min-w-[2.5rem] h-8 px-3 rounded-full text-sm font-semibold"
        style={{ backgroundColor: accentColor + '14', color: accentColor }}
      >
        {count}
      </div>
    </div>
  )
}
