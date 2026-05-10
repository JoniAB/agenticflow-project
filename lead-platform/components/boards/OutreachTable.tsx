'use client'

import { useState } from 'react'
import { Company, Outreach, Content } from '@/lib/types'
import { StatusDot } from '@/components/ui/StatusDot'
import { formatRelativeDate, cn } from '@/lib/utils'
import { MessageCircle, ExternalLink, ChevronRight, ChevronDown, Mail, Copy, Check } from 'lucide-react'

type OutreachRow = Company & { outreach: Outreach | null; content: Content | null }
type Filter = 'all' | 'replied' | 'pending' | 'follow_up'

const TABS: { value: Filter; label: string }[] = [
  { value: 'all',       label: 'All'       },
  { value: 'replied',   label: 'Replied'   },
  { value: 'pending',   label: 'No Reply'  },
  { value: 'follow_up', label: 'Follow-up' },
]

const COLS = ['', 'Company', 'Sent', 'Replied', 'Preview', 'Follow-ups', 'Last Activity', 'Status']

function matchFilter(c: OutreachRow, f: Filter) {
  if (f === 'all')       return true
  if (f === 'replied')   return !!c.outreach?.replied
  if (f === 'follow_up') return c.status === 'followup_sent'
  if (f === 'pending')   return !c.outreach?.replied && c.status === 'sent'
  return true
}

function EmailPanel({ content, outreach }: { content: Content; outreach: Outreach | null }) {
  const [copied, setCopied] = useState(false)

  async function copyEmail() {
    const text = [content.email_subject ? `נושא: ${content.email_subject}` : '', content.email_body ?? '']
      .filter(Boolean).join('\n\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <tr>
      <td colSpan={COLS.length} className="px-0 pb-3">
        <div className="mx-4 space-y-3">

          {/* Sent email */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">מייל ששלחנו</p>
                  <p className="text-sm font-semibold text-gray-900">{content.email_subject ?? '—'}</p>
                </div>
              </div>
              <button
                onClick={copyEmail}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-200 shrink-0"
              >
                {copied ? <><Check size={12} className="text-emerald-500" /> הועתק</> : <><Copy size={12} /> העתק</>}
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content.email_body ?? '—'}</p>
          </div>

          {/* Client reply */}
          {outreach?.replied && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle size={14} className="text-emerald-500 shrink-0" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">תגובת הלקוח</p>
                {outreach.replied_at && (
                  <span className="text-[10px] text-emerald-400 mr-auto">{formatRelativeDate(outreach.replied_at)}</span>
                )}
              </div>
              {outreach.reply_body
                ? <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{outreach.reply_body}</p>
                : outreach.reply_preview
                  ? <p className="text-sm text-gray-800 leading-relaxed">{outreach.reply_preview}</p>
                  : outreach.gmail_thread_id
                    ? <a href={`https://mail.google.com/mail/u/0/#inbox/${outreach.gmail_thread_id}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700">
                        <ExternalLink size={13} /> פתח ב-Gmail
                      </a>
                    : <p className="text-sm text-gray-400 italic">אין תוכן תגובה שמור</p>}
            </div>
          )}

        </div>
      </td>
    </tr>
  )
}

export function OutreachTable({ companies }: { companies: OutreachRow[] }) {
  const [filter,   setFilter]   = useState<Filter>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const rows = companies.filter(c => matchFilter(c, filter))

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="px-10 pt-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">Outreach Tracker</h1>
      <p className="text-sm text-gray-400 mt-1">Monitor sent emails, replies, and follow-up sequences</p>

      <div className="flex items-center gap-1 mt-5">
        {TABS.map(tab => {
          const count  = companies.filter(c => matchFilter(c, tab.value)).length
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
              {COLS.map((h, i) => (
                <th key={i} className="text-left pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider first:pl-0 last:pr-0 px-4">
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
              const o          = c.outreach
              const isExpanded = expanded.has(c.id)
              const isLast     = i === rows.length - 1
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
                    {/* Expand toggle */}
                    <td className="py-3.5 pl-0 pr-2 w-6">
                      <button
                        onClick={e => { e.stopPropagation(); toggle(c.id) }}
                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </td>
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
                  {isExpanded && c.content && <EmailPanel key={`${c.id}-email`} content={c.content} outreach={c.outreach} />}
                  {isExpanded && !c.content && (
                    <tr key={`${c.id}-no-email`}>
                      <td colSpan={COLS.length} className="px-4 pb-3">
                        <p className="text-sm text-gray-400 italic bg-gray-50 rounded-xl px-4 py-3">אין תוכן שמור עבור ליד זה</p>
                      </td>
                    </tr>
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
