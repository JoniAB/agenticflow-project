import { LucideIcon } from 'lucide-react'

interface EmptyBoardProps {
  icon: LucideIcon
  title: string
  subtitle: string
  description: string
}

export function EmptyBoard({ icon: Icon, title, subtitle, description }: EmptyBoardProps) {
  return (
    <div className="px-10 pt-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-400 mt-1">{subtitle}</p>

      <div className="mt-16 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <Icon size={24} className="text-gray-400" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium text-gray-500">{description}</p>
        <p className="text-xs text-gray-400 mt-1">This board will populate automatically as agents run</p>
      </div>
    </div>
  )
}
