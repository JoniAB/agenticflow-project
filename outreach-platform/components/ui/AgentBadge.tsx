import { cn } from '@/lib/utils'

const AGENT_STYLES: Record<string, { color: string; bg: string }> = {
  'research-agent':      { color: 'text-blue-700',   bg: 'bg-blue-50' },
  'qualification-agent': { color: 'text-purple-700', bg: 'bg-purple-50' },
  'outbound-agent':      { color: 'text-orange-700', bg: 'bg-orange-50' },
  'followup-agent':      { color: 'text-yellow-700', bg: 'bg-yellow-50' },
  'human':               { color: 'text-gray-700',   bg: 'bg-gray-100' },
}

export function AgentBadge({ agentId }: { agentId: string | null }) {
  if (!agentId) return <span className="text-gray-300 text-xs">—</span>
  const style = AGENT_STYLES[agentId] ?? { color: 'text-gray-600', bg: 'bg-gray-100' }
  const label = agentId.replace('-agent', '')
  return (
    <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium', style.color, style.bg)}>
      {label}
    </span>
  )
}
