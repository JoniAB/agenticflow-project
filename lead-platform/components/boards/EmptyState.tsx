import { Inbox } from 'lucide-react'

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-[#E4E6EF] shadow-sm mb-4">
        <Inbox size={22} className="text-[#9CA0B8]" />
      </div>
      <p className="text-sm font-medium text-[#6B6F8A]">{message}</p>
      <p className="text-xs text-[#9CA0B8] mt-1">Leads will appear here once agents process them.</p>
    </div>
  )
}
