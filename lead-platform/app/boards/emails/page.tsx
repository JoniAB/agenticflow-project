import { EmptyBoard } from '@/components/boards/EmptyBoard'
import { Mail } from 'lucide-react'

export default function EmailsPage() {
  return (
    <EmptyBoard
      icon={Mail}
      title="Email Review"
      subtitle="Outgoing emails flagged for manual review before sending"
      description="No emails pending review"
    />
  )
}
