import { EmptyBoard } from '@/components/boards/EmptyBoard'
import { Activity } from 'lucide-react'

export default function ActivityPage() {
  return (
    <EmptyBoard
      icon={Activity}
      title="Agent Activity"
      subtitle="Live log of all agent runs, tasks, and decisions"
      description="No agent activity recorded yet"
    />
  )
}
