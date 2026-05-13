'use client'

import { useState, useEffect } from 'react'
import { Company, Outreach, Content } from '@/lib/types'
import { ClientCardTableRow, type ClientCardData } from '@/components/boards/ClientCard'
import { useSelection } from '@/components/providers/SelectionProvider'
import { formatRelativeDate, cn } from '@/lib/utils'
import {
  MessageCircle, ExternalLink, ChevronRight, ChevronDown,
  Mail, Clock, CheckCheck, Send, Inbox,
} from 'lucide-react'
import { MoveToBoardMenu } from '@/components/ui/MoveToBoardMenu'

export type OutreachRow = Company & { outreach: Outreach | null; content: Content | null }
type Tab = 'sent' | 'inbox' | 'all' | 'followup'

const TABS: { value: Tab; label: string; icon: React.ElementType }[] = [
  { value: 'sent',    label: 'Sent',      icon: Send    },
  { value: 'inbox',   label: 'Inbox',     icon: Inbox   },
  { value: 'followup',label: 'Follow-up', icon: Clock   },
  { value: 'all',     label: 'All',       icon: Mail    },
]

function toCardData(c: OutreachRow): ClientCardData {
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
      recipient_email: c.outreach.recipient_email,
    } : null,
  }
}

// ─── Sent tab ─────────────────────────────────────────────────────────────────

function SentItem({ c, expanded, onToggle, onRemove }: {
  c: OutreachRow
  expanded: boolean
  onToggle: () => void
  onRemove: () => void
}) {
  const o       = c.outreach
  const content = c.content
  const isPending  = c.status === 'approved'
  const hasReplied = !!o?.replied

  return (
    <div className={cn(
      'border rounded-xl overflow-hidden transition-colors',
      expanded ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-100 bg-white hover:border-gray-200',
    )}>
      {/* Header row */}
      <div
        onClick={onToggle}
        className="flex items-start gap-3 px-4 py-3 cursor-pointer"
      >
        {/* Avatar */}
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
          isPending  ? 'bg-amber-100 text-amber-700' :
          hasReplied ? 'bg-emerald-100 text-emerald-700' :
                       'bg-indigo-100 text-indigo-700',
        )}>
          {c.name.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="font-semibold text-gray-900 text-sm truncate">{c.name}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              {hasReplied && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">
                  <MessageCircle size={9} /> ענה
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">
                  <Clock size={9} /> טיוטה
                </span>
              )}
              <span className="text-[11px] text-gray-400">
                {formatRelativeDate(o?.sent_at ?? c.updated_at)}
              </span>
              <MoveToBoardMenu
                companyId={c.id}
                currentStatus={c.status}
                onMoved={onRemove}
              />
              {expanded ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />}
            </div>
          </div>

          {content?.email_subject && (
            <p className="text-sm font-medium text-gray-700 truncate" dir="rtl">
              {content.email_subject}
            </p>
          )}
          {content?.email_body && !expanded && (
            <p className="text-xs text-gray-400 truncate mt-0.5" dir="rtl">
              {content.email_body.slice(0, 120)}
            </p>
          )}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
          {/* Recipient */}
          {o?.recipient_email && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <CheckCheck size={12} className="text-gray-400" />
              נשלח אל: <span className="font-medium">{o.recipient_email}</span>
              {o.sent_at && <span className="text-gray-400">· {new Date(o.sent_at).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>}
            </div>
          )}

          {/* Email body */}
          {content?.email_body && (
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">הודעה שנשלחה</p>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap" dir="rtl">
                {content.email_body}
              </p>
            </div>
          )}

          {/* Reply */}
          {hasReplied && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">תגובת הלקוח</p>
                {o?.replied_at && (
                  <span className="text-[10px] text-emerald-500">
                    {new Date(o.replied_at).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              {o?.reply_body
                ? <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap" dir="rtl">{o.reply_body}</p>
                : o?.reply_preview
                  ? <p className="text-sm text-gray-700 leading-relaxed" dir="rtl">{o.reply_preview}</p>
                  : o?.gmail_thread_id
                    ? <a href={`https://mail.google.com/mail/u/0/#inbox/${o.gmail_thread_id}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700">
                        <ExternalLink size={13} /> פתח ב-Gmail
                      </a>
                    : <p className="text-sm text-gray-400 italic">אין תוכן תגובה</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Inbox tab (replies only, table style) ────────────────────────────────────

const INBOX_COLS = ['', 'Company', 'Replied', 'Preview', 'Last Activity', 'Follow-ups']

function InboxTable({ rows, expanded, onToggle, onRemove }: {
  rows: OutreachRow[]
  expanded: Set<string>
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}) {
  if (rows.length === 0) return (
    <div className="flex flex-col items-center text-center text-gray-400 py-20">
      <Inbox size={32} className="mb-3 opacity-20" />
      <p className="text-sm">אין תגובות עדיין</p>
    </div>
  )
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200">
          {INBOX_COLS.map((h, i) => (
            <th key={i} className="text-left pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider first:pl-0 px-4">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((c, i) => {
          const o          = c.outreach
          const isExpanded = expanded.has(c.id)
          const isLast     = i === rows.length - 1
          const isDraft    = c.status === 'awaiting_approval'
          return (
            <>
              <tr
                key={c.id}
                onClick={() => onToggle(c.id)}
                className={cn(
                  'group hover:bg-gray-50 transition-colors cursor-pointer',
                  !isExpanded && !isLast && 'border-b border-gray-100',
                )}
              >
                <td className="py-3.5 pl-0 pr-2 w-6">
                  <button onClick={e => { e.stopPropagation(); onToggle(c.id) }}
                    className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                </td>
                <td className="py-3.5 pl-0 pr-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    {isDraft && <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">טיוטה</span>}
                  </div>
                  {o?.recipient_email && <p className="text-xs text-gray-400 mt-0.5">{o.recipient_email}</p>}
                </td>
                <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                  {isDraft ? <span className="text-amber-500">ממתין לאישור</span> : formatRelativeDate(o?.replied_at)}
                </td>
                <td className="px-4 py-3.5 max-w-[240px]">
                  {o?.reply_preview
                    ? <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MessageCircle size={11} className="text-gray-300 shrink-0" />
                        <span className="truncate" dir="rtl">{o.reply_preview}</span>
                      </span>
                    : o?.gmail_thread_id
                      ? <a href={`https://mail.google.com/mail/u/0/#inbox/${o.gmail_thread_id}`}
                          target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
                          <ExternalLink size={11} /> Open thread
                        </a>
                      : <span className="text-gray-400 text-xs">—</span>}
                </td>
                <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                  {formatRelativeDate(o?.replied_at ?? o?.sent_at)}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={cn(
                    'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold',
                    (o?.follow_up_count ?? 0) > 0 ? 'bg-amber-50 text-amber-700' : 'text-gray-400',
                  )}>
                    {o?.follow_up_count ?? 0}
                  </span>
                </td>
                <td className="py-3.5 pl-2 pr-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoveToBoardMenu
                    companyId={c.id}
                    currentStatus={c.status}
                    onMoved={() => onRemove(c.id)}
                  />
                </td>
              </tr>
              {isExpanded && (
                <ClientCardTableRow
                  key={`${c.id}-card`}
                  data={toCardData(c)}
                  colSpan={INBOX_COLS.length + 1}
                  className="px-4 pb-4 pt-1"
                />
              )}
            </>
          )
        })}
      </tbody>
    </table>
  )
}

// ─── All tab (original table) ─────────────────────────────────────────────────

const ALL_COLS = ['', 'Company', 'Sent', 'Replied', 'Preview', 'Follow-ups', 'Last Activity', 'Status']

function AllTable({ rows, expanded, onToggle }: {
  rows: OutreachRow[]
  expanded: Set<string>
  onToggle: (id: string) => void
}) {
  if (rows.length === 0) return (
    <div className="py-16 text-center text-sm text-gray-400">No leads</div>
  )
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200">
          {ALL_COLS.map((h, i) => (
            <th key={i} className="text-left pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider first:pl-0 last:pr-0 px-4">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((c, i) => {
          const o          = c.outreach
          const isExpanded = expanded.has(c.id)
          const isLast     = i === rows.length - 1
          return (
            <>
              <tr
                key={c.id}
                onClick={() => onToggle(c.id)}
                className={cn(
                  'group hover:bg-gray-50 transition-colors cursor-pointer',
                  !isExpanded && !isLast && 'border-b border-gray-100',
                )}
              >
                <td className="py-3.5 pl-0 pr-2 w-6">
                  <button onClick={e => { e.stopPropagation(); onToggle(c.id) }}
                    className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                </td>
                <td className="py-3.5 pl-0 pr-4">
                  <p className="font-medium text-gray-900">{c.name}</p>
                  {o?.recipient_email && <p className="text-xs text-gray-400 mt-0.5">{o.recipient_email}</p>}
                </td>
                <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                  {o?.sent_at ? formatRelativeDate(o.sent_at) : <span className="text-amber-500 text-xs">ממתין</span>}
                </td>
                <td className="px-4 py-3.5">
                  {o?.replied
                    ? <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Yes</span>
                    : <span className="inline-flex items-center gap-1 text-xs text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-300" />No</span>}
                </td>
                <td className="px-4 py-3.5 max-w-[200px]">
                  {o?.reply_preview
                    ? <span className="flex items-center gap-1 text-xs text-gray-500"><MessageCircle size={11} className="text-gray-300 shrink-0" /><span className="truncate" dir="rtl">{o.reply_preview}</span></span>
                    : <span className="text-gray-400 text-xs">—</span>}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={cn('inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold',
                    (o?.follow_up_count ?? 0) > 0 ? 'bg-amber-50 text-amber-700' : 'text-gray-400')}>
                    {o?.follow_up_count ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                  {formatRelativeDate(o?.last_follow_up_at ?? o?.replied_at ?? o?.sent_at)}
                </td>
                <td className="py-3.5 pl-4 pr-0">
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    c.status === 'replied'       ? 'bg-emerald-50 text-emerald-600' :
                    c.status === 'sent'          ? 'bg-indigo-50 text-indigo-600' :
                    c.status === 'followup_sent' ? 'bg-cyan-50 text-cyan-600' :
                    c.status === 'approved'      ? 'bg-amber-50 text-amber-600' :
                                                   'bg-gray-100 text-gray-500',
                  )}>
                    {c.status}
                  </span>
                </td>
              </tr>
              {isExpanded && (
                <ClientCardTableRow
                  key={`${c.id}-card`}
                  data={toCardData(c)}
                  colSpan={ALL_COLS.length}
                  className="px-4 pb-4 pt-1"
                />
              )}
            </>
          )
        })}
      </tbody>
    </table>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OutreachTable({ companies }: { companies: OutreachRow[] }) {
  const [tab,       setTab]       = useState<Tab>('sent')
  const [expanded,  setExpanded]  = useState<Set<string>>(new Set())
  const [localRows, setLocalRows] = useState<OutreachRow[]>(companies)
  const { selected, toggle: toggleSelect, selectAll, clear } = useSelection()

  useEffect(() => { setLocalRows(companies) }, [companies])

  useEffect(() => {
    function onMoved(e: Event) {
      const ids = new Set((e as CustomEvent<{ ids: string[] }>).detail.ids)
      setLocalRows(prev => prev.filter(c => !ids.has(c.id)))
    }
    window.addEventListener('board-items-moved', onMoved)
    return () => window.removeEventListener('board-items-moved', onMoved)
  }, [])

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const sentRows     = localRows.filter(c => c.status !== 'awaiting_approval')
  const draftRows    = localRows.filter(c => c.status === 'awaiting_approval')
  const inboxRows    = localRows.filter(c => c.outreach?.replied || c.status === 'awaiting_approval')
  const followupRows = localRows.filter(c => c.status === 'followup_sent')

  const counts = {
    sent:     sentRows.length,
    inbox:    inboxRows.length,
    followup: followupRows.length,
    all:      localRows.length,
  }

  return (
    <div className="px-10 pt-8 pb-12">
      <div className="flex items-center gap-3 mb-1">
        <Mail size={22} className="text-indigo-500" />
        <h1 className="text-2xl font-bold text-gray-900">Mail</h1>
      </div>
      <p className="text-sm text-gray-400 mt-1">Sent emails, replies, and follow-up sequences</p>


      {/* Tabs */}
      <div className="flex items-center gap-1 mt-5 border-b border-gray-100 pb-0">
        {TABS.map(t => {
          const active = tab === t.value
          const count  = counts[t.value]
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                active
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200',
              )}
            >
              <t.icon size={13} />
              {t.label}
              {count > 0 && (
                <span className={cn(
                  'text-[11px] font-semibold rounded-full px-1.5 min-w-[18px] text-center tabular-nums',
                  active ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400',
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-5">
        {tab === 'sent' && (
          <div className="space-y-2">
            {sentRows.length === 0 ? (
              <div className="flex flex-col items-center text-center text-gray-400 py-20">
                <Send size={32} className="mb-3 opacity-20" />
                <p className="text-sm">אין הודעות שנשלחו</p>
              </div>
            ) : sentRows.map(c => (
              <SentItem
                key={c.id}
                c={c}
                expanded={expanded.has(c.id)}
                onToggle={() => toggle(c.id)}
                onRemove={() => setLocalRows(prev => prev.filter(r => r.id !== c.id))}
              />
            ))}
          </div>
        )}

        {tab === 'inbox' && (
          <InboxTable
            rows={inboxRows}
            expanded={expanded}
            onToggle={toggle}
            onRemove={id => setLocalRows(prev => prev.filter(r => r.id !== id))}
          />
        )}

        {tab === 'followup' && (
          followupRows.length === 0
            ? <div className="py-16 text-center text-sm text-gray-400">No follow-up emails</div>
            : <AllTable rows={followupRows} expanded={expanded} onToggle={toggle} />
        )}

        {tab === 'all' && (
          <AllTable rows={localRows} expanded={expanded} onToggle={toggle} />
        )}
      </div>
    </div>
  )
}
