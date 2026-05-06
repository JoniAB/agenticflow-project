'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Company, Outreach } from '@/lib/types'
import { StatusDot } from '@/components/ui/StatusDot'
import { formatRelativeDate, cn } from '@/lib/utils'
import { MessageCircle, ExternalLink } from 'lucide-react'

type OutreachRow = Company & { outreach: Outreach | null }
type Filter = 'all' | 'replied' | 'pending' | 'follow_up'

const TABS: { value: Filter; label: string }[] = [
  { value: 'all',       label: 'All'       },
  { value: 'replied',   label: 'Replied'   },
  { value: 'pending',   label: 'No Reply'  },
  { value: 'follow_up', label: 'Follow-up' },
]

const COLS = ['Company', 'Sent', 'Replied', 'Preview', 'Follow-ups', 'Last Activity', 'Status']

function matchFilter(c: OutreachRow, f: Filter) {
  if (f === 'all') return true
  if (f === 'replied') return !!c.outreach?.replied
  if (f === 'follow_up') return c.status === 'followup_sent'
  if (f === 'pending') return !c.outreach?.replied && c.status === 'sent'
  return true
}

export function OutreachTable({ companies }: { companies: OutreachRow[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const router = useRouter()
  const rows = companies.filter(c => matchFilter(c, filter))

  return (
    <div className="px-10 pt-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">Outreach Tracker</h1>
      <p className="text-sm text-gray-400 mt-1">Monitor sent emails, replies, and follow-up sequences</p>

      <div className="flex items-center gap-1 mt-5">
        {TABS.map(tab => {
          const count = companies.filter(c => matchFilter(c, tab.value)).length
          const active = filter === tab.value
          return (
            <button key={tab.value} onClick={() => setFilter(tab.value)}
              className={cn('px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                active ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-800')}>
              {tab.label}
              {active && count > 0 && <span className="ml-1.5 opacity-70 text-xs">{count}</span>}
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {COLS.map(h => (
                <th key={h} className="text-left pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider first:pl-0 last:pr-0 px-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={COLS.length} className="py-16 text-center text-sm text-gray-400">
                  No leads match this filter
                </td>
              </tr>
            ) : rows.map((c, i) => {
              const o = c.outreach
              return (
                <tr key={c.id} onClick={() => router.push(`/boards/lead/${c.id}`)} className={cn('group hover:bg-gray-50 transition-colors cursor-pointer', i !== rows.length - 1 && 'border-b border-gray-100')}>
                  {/* Company */}
                  <td className="py-3.5 pl-0 pr-4">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    {o?.recipient_email && <p className="text-xs text-gray-400 mt-0.5">{o.recipient_email}</p>}
                  </td>
                  {/* Sent */}
                  <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                    {formatRelativeDate(o?.sent_at)}
                  </td>
                  {/* Replied */}
                  <td className="px-4 py-3.5">
                    {o?.replied
                      ? <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>Yes</span>
                      : <span className="inline-flex items-center gap-1 text-xs text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-300"/>No</span>}
                  </td>
                  {/* Preview */}
                  <td className="px-4 py-3.5 max-w-[200px]">
                    {o?.reply_preview
                      ? <span className="flex items-center gap-1 text-xs text-gray-500"><MessageCircle size={11} className="text-gray-300 shrink-0"/><span className="truncate">{o.reply_preview}</span></span>
                      : o?.gmail_thread_id
                        ? <a href={`https://mail.google.com/mail/u/0/#inbox/${o.gmail_thread_id}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"><ExternalLink size={11}/>Open thread</a>
                        : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  {/* Follow-ups */}
                  <td className="px-4 py-3.5 text-center">
                    <span className={cn('inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold',
                      (o?.follow_up_count ?? 0) > 0 ? 'bg-amber-50 text-amber-700' : 'text-gray-400')}>
                      {o?.follow_up_count ?? 0}
                    </span>
                  </td>
                  {/* Last activity */}
                  <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {formatRelativeDate(o?.last_follow_up_at ?? o?.replied_at ?? o?.sent_at)}
                  </td>
                  {/* Status */}
                  <td className="py-3.5 pl-4 pr-0"><StatusDot status={c.status}/></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
