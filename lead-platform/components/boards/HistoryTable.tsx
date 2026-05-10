'use client'

import { useState } from 'react'
import { Company, Outreach, Content } from '@/lib/types'
import { ClientCardTableRow, type ClientCardData } from '@/components/boards/ClientCard'
import { formatRelativeDate, cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, MessageCircle } from 'lucide-react'

type HistoryRow = Company & { outreach: Outreach | null; content: Content | null }

const COLS = ['', 'Company', 'Industry', 'Sent', 'Replied', 'תגובה']

function toCardData(c: HistoryRow): ClientCardData {
  return {
    notes:         c.notes,
    contact_name:  c.contact_name,
    contact_email: c.contact_email,
    contact_phone: c.contact_phone,
    domain:        c.domain,
    content: c.content ? {
      email_subject: c.content.email_subject,
      email_body:    c.content.email_body,
      page_url:      c.content.page_url,
      report_url:    c.content.report_url,
    } : null,
    outreach: c.outreach ? {
      sent_at:         c.outreach.sent_at,
      replied:         c.outreach.replied,
      reply_body:      c.outreach.reply_body,
      reply_preview:   c.outreach.reply_preview,
      gmail_thread_id: c.outreach.gmail_thread_id,
      replied_at:      c.outreach.replied_at,
    } : null,
  }
}

export function HistoryTable({ companies }: { companies: HistoryRow[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (companies.length === 0) {
    return (
      <div className="px-10 pt-8 pb-12">
        <h1 className="text-2xl font-bold text-gray-900">Client History</h1>
        <p className="text-sm text-gray-400 mt-1">לקוחות שענו לאאוטריץ׳ — כל ההיסטוריה במקום אחד</p>
        <div className="flex flex-col items-center text-center text-gray-400 py-24">
          <MessageCircle size={36} className="mb-3 opacity-15" />
          <p className="text-sm">עדיין אין לקוחות שענו</p>
          <p className="text-xs mt-1 opacity-60">לקוחות שיגיבו לאימייל יופיעו כאן</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-10 pt-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">Client History</h1>
      <p className="text-sm text-gray-400 mt-1">לקוחות שענו לאאוטריץ׳ — כל ההיסטוריה במקום אחד</p>

      <div className="mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {COLS.map((h, i) => (
                <th key={i} className="text-left pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider first:pl-0 last:pr-0 px-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companies.map((c, i) => {
              const o          = c.outreach
              const isExpanded = expanded.has(c.id)
              const isLast     = i === companies.length - 1
              const preview    = o?.reply_body?.slice(0, 80) ?? o?.reply_preview ?? null
              return (
                <>
                  <tr
                    key={c.id}
                    onClick={() => toggle(c.id)}
                    className={cn(
                      'group hover:bg-gray-50 transition-colors cursor-pointer',
                      !isExpanded && !isLast && 'border-b border-gray-100'
                    )}
                  >
                    <td className="py-3.5 pl-0 pr-2 w-6">
                      <button onClick={e => { e.stopPropagation(); toggle(c.id) }}
                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </td>
                    <td className="py-3.5 pl-0 pr-4">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      {o?.recipient_email && <p className="text-xs text-gray-400 mt-0.5">{o.recipient_email}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">{c.industry ?? '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {formatRelativeDate(o?.sent_at)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {o?.replied_at ? formatRelativeDate(o.replied_at) : '—'}
                    </td>
                    <td className="px-4 py-3.5 max-w-[260px]">
                      {preview
                        ? <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                            <MessageCircle size={11} className="shrink-0" />
                            <span className="truncate">{preview}{(o?.reply_body?.length ?? 0) > 80 ? '…' : ''}</span>
                          </span>
                        : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                  </tr>
                  {isExpanded && (
                    <ClientCardTableRow
                      key={`${c.id}-card`}
                      data={toCardData(c)}
                      colSpan={COLS.length}
                      className="px-4 pb-4 pt-1"
                    />
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
