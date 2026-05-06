import Link from 'next/link'
import { Lead } from '@/lib/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { IcpScore } from '@/components/ui/IcpScore'
import { AgentBadge } from '@/components/ui/AgentBadge'
import { Tooltip } from '@/components/ui/Tooltip'
import { timeAgo, daysInStage } from '@/lib/utils'
import { COLUMN_HEBREW } from '@/lib/hebrew'
import { cn } from '@/lib/utils'
import { Mail, Link2, MessageCircle } from 'lucide-react'

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  email:    <Mail className="w-3.5 h-3.5" />,
  linkedin: <Link2 className="w-3.5 h-3.5" />,
  whatsapp: <MessageCircle className="w-3.5 h-3.5" />,
}

function ColHeader({ label }: { label: string }) {
  const hebrew = COLUMN_HEBREW[label]
  return (
    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
      {hebrew ? (
        <Tooltip hebrew={hebrew} dir="bottom">
          <span className="cursor-default border-b border-dashed border-gray-400/50 pb-px">{label}</span>
        </Tooltip>
      ) : (
        <span>{label}</span>
      )}
    </th>
  )
}

interface Props {
  leads: Lead[]
  showIcp?: boolean
  showChannel?: boolean
}

export function LeadTable({ leads, showIcp = false, showChannel = false }: Props) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-sm">No leads on this board yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80">
            <ColHeader label="Status" />
            <ColHeader label="Company" />
            <ColHeader label="Industry" />
            <ColHeader label="Contact" />
            <ColHeader label="Agent" />
            <ColHeader label="Last Activity" />
            <ColHeader label="Days in Stage" />
            {showIcp && <ColHeader label="ICP Score" />}
            {showChannel && <ColHeader label="Channel" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {leads.map((lead) => {
            const days = daysInStage(lead.updated_at)
            return (
              <tr key={lead.lead_id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="px-4 py-3.5">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3.5">
                  <Link
                    href={`/boards/lead/${lead.lead_id}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                  >
                    {lead.company_name}
                  </Link>
                  {lead.website && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">
                      {lead.website.replace(/^https?:\/\//, '')}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3.5 text-gray-600 text-sm">{lead.industry ?? <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3.5">
                  {lead.contact_name ? (
                    <div>
                      <p className="text-gray-800 font-medium">{lead.contact_name}</p>
                      <p className="text-xs text-gray-400">{lead.contact_title}</p>
                    </div>
                  ) : <span className="text-gray-300 text-sm">—</span>}
                </td>
                <td className="px-4 py-3.5">
                  <AgentBadge agentId={lead.assigned_agent} />
                </td>
                <td className="px-4 py-3.5 text-gray-400 text-xs">{timeAgo(lead.updated_at)}</td>
                <td className="px-4 py-3.5">
                  <span className={cn(
                    'text-sm font-semibold',
                    days > 5 ? 'text-red-500' : days > 2 ? 'text-yellow-500' : 'text-gray-400'
                  )}>
                    {days}d{days > 5 && ' ⚠'}
                  </span>
                </td>
                {showIcp && (
                  <td className="px-4 py-3.5">
                    <IcpScore score={lead.icp_score} />
                  </td>
                )}
                {showChannel && (
                  <td className="px-4 py-3.5 text-gray-500">
                    {lead.outreach_channel
                      ? <span className="flex items-center gap-1.5 text-xs">{CHANNEL_ICON[lead.outreach_channel]}{lead.outreach_channel}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
