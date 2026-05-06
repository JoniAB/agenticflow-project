import { EmptyBoard } from '@/components/boards/EmptyBoard'
import { Clock } from 'lucide-react'

export default function HistoryPage() {
  return (
    <EmptyBoard
      icon={Clock}
      title="Client History"
      subtitle="Closed deals, converted leads, and archived contacts"
      description="No closed clients yet"
    />
  )
}
