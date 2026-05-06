'use client'

import { useState } from 'react'
import { Lead, ActivityLog } from '@/lib/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { IcpScore } from '@/components/ui/IcpScore'
import { AgentBadge } from '@/components/ui/AgentBadge'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { BOARDS } from '@/lib/board-config'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const ACTIVITY_ICONS: Record<string, string> = {
  advance:        '→',
  reject:         '✕',
  field_update:   '✎',
  scheduled_check:'⏰',
  outreach:       '✉',
  followup:       '↩',
  note:           '•',
}

type Tab = 'overview' | 'outreach' | 'qualification' | 'activity' | 'notes'

interface Props {
  lead: Lead
  activity: ActivityLog[]
}

export function LeadCard({ lead, activity }: Props) {
  const [tab, setTab] = useState<Tab>('overview')
  const board = BOARDS.find(b => b.id === lead.current_board)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview',      label: 'Overview' },
    { id: 'outreach',      label: 'Outreach' },
    { id: 'qualification', label: 'Qualification' },
    { id: 'activity',      label: `Activity (${activity.length})` },
    { id: 'notes',         label: 'Notes' },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 flex items-center gap-2">
        <Link href={`/boards/${lead.current_board}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
          <ArrowLeft className="w-4 h-4" />
          {board?.name}
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{lead.company_name}</h1>
              {lead.website && (
                <a href={lead.website} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mt-0.5">
                  {lead.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={lead.status} />
              {lead.icp_score !== null && <IcpScore score={lead.icp_score} />}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 flex gap-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-3 py-3 text-sm border-b-2 -mb-px transition-colors',
                tab === t.id
                  ? 'border-indigo-600 text-indigo-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {tab === 'overview' && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <Field label="Industry" value={lead.industry} />
              <Field label="Employees" value={lead.employee_count?.toString()} />
              <Field label="Location" value={lead.hq_location} />
              <Field label="LinkedIn" value={lead.linkedin_url} link />
              <Field label="Board" value={board?.name} />
              <Field label="Assigned Agent" value={null}>
                <AgentBadge agentId={lead.assigned_agent} />
              </Field>
              <Field label="Contact Name" value={lead.contact_name} />
              <Field label="Contact Title" value={lead.contact_title} />
              <Field label="Contact Email" value={lead.contact_email} />
              <Field label="Contact LinkedIn" value={lead.contact_linkedin} link />
              <Field label="Created" value={timeAgo(lead.created_at)} />
              <Field label="Last Updated" value={timeAgo(lead.updated_at)} />
            </div>
          )}

          {tab === 'outreach' && (
            <div className="space-y-4 text-sm">
              <Field label="Channel" value={lead.outreach_channel} />
              <Field label="First Message Sent" value={lead.first_message_sent_at ? timeAgo(lead.first_message_sent_at) : null} />
              {lead.first_message_text && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">First Message</p>
                  <p className="text-gray-700 bg-gray-50 rounded p-3 whitespace-pre-wrap">{lead.first_message_text}</p>
                </div>
              )}
              <Field label="Follow-up Count" value={lead.followup_count.toString()} />
              <Field label="Next Follow-up" value={lead.next_followup_at ? timeAgo(lead.next_followup_at) : null} />
              <Field label="Response Received" value={lead.response_received_at ? timeAgo(lead.response_received_at) : null} />
              <Field label="Response Sentiment" value={lead.response_sentiment} />
            </div>
          )}

          {tab === 'qualification' && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">ICP Score</p>
                <IcpScore score={lead.icp_score} />
              </div>
              {lead.icp_notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Scoring Notes</p>
                  <p className="text-gray-700 bg-gray-50 rounded p-3">{lead.icp_notes}</p>
                </div>
              )}
              {lead.rejection_reason && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Rejection Reason</p>
                  <p className="text-red-600 bg-red-50 rounded p-3">{lead.rejection_reason}</p>
                </div>
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div className="space-y-2">
              {activity.length === 0 && <p className="text-gray-400 text-sm">No activity recorded yet.</p>}
              {activity.map(event => (
                <div key={event.activity_id} className="flex gap-3 text-sm">
                  <span className="text-gray-400 w-4 text-center shrink-0 mt-0.5">{ACTIVITY_ICONS[event.type] ?? '•'}</span>
                  <div className="flex-1">
                    <p className="text-gray-700">{event.body}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <AgentBadge agentId={event.agent_id} />
                      <span className="text-xs text-gray-400">{timeAgo(event.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'notes' && (
            <div className="text-sm">
              {lead.agent_notes
                ? <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-3">{lead.agent_notes}</p>
                : <p className="text-gray-400">No notes yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, link = false, children }: {
  label: string
  value?: string | null
  link?: boolean
  children?: React.ReactNode
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      {children ?? (
        value
          ? link
            ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate block">{value}</a>
            : <p className="text-gray-800">{value}</p>
          : <p className="text-gray-300">—</p>
      )}
    </div>
  )
}
