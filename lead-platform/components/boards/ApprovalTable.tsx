'use client'

import { useState, useRef } from 'react'
import { Company, Content } from '@/lib/types'
import { StatusDot } from '@/components/ui/StatusDot'
import { ApproveButton } from '@/components/boards/ApproveButton'
import { ClientCardContent, type ClientCardData } from '@/components/boards/ClientCard'
import { formatRelativeDate, cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, RefreshCw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

type ApprovalRow = Company & { content: Content | null }
type Filter = 'all' | 'deployed' | 'draft'

const TABS: { value: Filter; label: string }[] = [
  { value: 'all',      label: 'All'       },
  { value: 'deployed', label: 'Page Live' },
  { value: 'draft',    label: 'Draft'     },
]

const COLS = ['', 'Company', 'Email Subject', 'Added', 'Status', 'Action']

function toCardData(c: ApprovalRow): ClientCardData {
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
  }
}

type RegenStatus = 'idle' | 'loading' | 'done' | 'error'

function RegenPanel({ companyId, onDone }: { companyId: string; onDone: () => void }) {
  const [instructions, setInstructions] = useState('')
  const [status,       setStatus]       = useState<RegenStatus>('idle')
  const [msg,          setMsg]          = useState<string | null>(null)
  const [step,         setStep]         = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  async function regen() {
    if (status === 'loading') return
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setStatus('loading'); setStep(0); setMsg('מתחיל...')
    try {
      const res = await fetch(`/api/generate-content/next?company_id=${companyId}&stream=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructions: instructions || null }),
        signal: ctrl.signal,
      })
      if (!res.ok || !res.body) { setStatus('error'); setMsg('שגיאה'); setTimeout(() => { setStatus('idle'); setMsg(null) }, 3000); return }
      const reader = res.body.getReader()
      const dec    = new TextDecoder()
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const parts = buf.split('\n\n'); buf = parts.pop() ?? ''
        for (const part of parts) {
          if (!part.trim()) continue
          let ev = '', dat = ''
          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) ev  = line.slice(7)
            else if (line.startsWith('data: '))  dat = line.slice(6)
          }
          if (!ev || !dat) continue
          try {
            const p = JSON.parse(dat)
            if (ev === 'progress') { setStep(p.step ?? 0); setMsg(p.message) }
            else if (ev === 'done')  { setStatus('done'); setTimeout(() => { setStatus('idle'); setMsg(null); onDone() }, 1500) }
            else if (ev === 'error') { setStatus('error'); setMsg(p.error ?? 'שגיאה'); setTimeout(() => { setStatus('idle'); setMsg(null) }, 4000) }
          } catch { /* ignore */ }
        }
      }
    } catch (e: unknown) {
      if ((e as Error)?.name !== 'AbortError') { setStatus('error'); setMsg('שגיאת רשת'); setTimeout(() => { setStatus('idle'); setMsg(null) }, 3000) }
    }
  }

  const STEPS = 4
  return (
    <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50 mt-3">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">✏️ הנחיות לעריכת האתר והמייל</p>
      <textarea
        value={instructions}
        onChange={e => setInstructions(e.target.value)}
        placeholder="לדוגמה: השתמש בטון יותר חם, הוסף דגש על גלריית תמונות, שנה את הצבע לירוק..."
        rows={2}
        dir="rtl"
        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-gray-300 resize-none"
      />
      {status === 'loading' && (
        <div className="mt-2 flex flex-col items-center gap-2 py-1">
          <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
            <Loader2 size={13} className="animate-spin" />{msg ?? 'מייצר...'}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: STEPS }, (_, i) => i + 1).map(s => (
              <div key={s} className={cn('h-1 rounded-full transition-all duration-500', step >= s ? 'w-4 bg-indigo-400' : 'w-1 bg-gray-200')} />
            ))}
          </div>
        </div>
      )}
      {status !== 'loading' && (
        <div className="mt-2 flex items-center justify-between">
          {status === 'done'  && <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12} /> נוצר מחדש</span>}
          {status === 'error' && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {msg}</span>}
          {status === 'idle'  && <span />}
          <button
            onClick={regen}
            disabled={status !== 'idle'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors"
          >
            <RefreshCw size={11} /> צור מחדש
          </button>
        </div>
      )}
    </div>
  )
}

export function ApprovalTable({ companies }: { companies: ApprovalRow[] }) {
  const [filter,    setFilter]    = useState<Filter>('all')
  const [localRows, setLocalRows] = useState<ApprovalRow[]>(companies)
  const [expanded,  setExpanded]  = useState<Set<string>>(new Set())

  function handleApproved(id: string) {
    setLocalRows(prev => prev.filter(c => c.id !== id))
  }

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const rows = filter === 'all' ? localRows
    : localRows.filter(c => filter === 'deployed'
        ? c.content?.page_status === 'deployed'
        : c.content?.page_status !== 'deployed')

  return (
    <div className="px-10 pt-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">Ready to Send</h1>
      <p className="text-sm text-gray-400 mt-1">Review full content before the sending agent dispatches emails</p>

      <div className="flex items-center gap-1 mt-5">
        {TABS.map(tab => {
          const count = tab.value === 'all' ? localRows.length
            : localRows.filter(c => tab.value === 'deployed'
                ? c.content?.page_status === 'deployed'
                : c.content?.page_status !== 'deployed').length
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
              const isExpanded = expanded.has(c.id)
              const isLast     = i === rows.length - 1
              return (
                <>
                  <tr
                    key={c.id}
                    className={cn(
                      'group hover:bg-gray-50 transition-colors',
                      !isExpanded && !isLast && 'border-b border-gray-100'
                    )}
                  >
                    {/* Expand */}
                    <td className="py-3.5 pl-0 pr-2 w-6">
                      <button
                        onClick={() => toggle(c.id)}
                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </td>
                    {/* Company */}
                    <td className="py-3.5 pl-0 pr-4">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      {c.industry && <p className="text-xs text-gray-400 mt-0.5">{c.industry}</p>}
                    </td>
                    {/* Email subject */}
                    <td className="px-4 py-3.5 max-w-[300px]">
                      {c.content?.email_subject
                        ? <p className="font-medium text-gray-800 truncate" dir="rtl">{c.content.email_subject}</p>
                        : <span className="text-gray-400">—</span>}
                      {c.content?.email_body && (
                        <p className="text-xs text-gray-400 truncate mt-0.5" dir="rtl">
                          {c.content.email_body.slice(0, 80)}…
                        </p>
                      )}
                    </td>
                    {/* Added */}
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {formatRelativeDate(c.updated_at)}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3.5"><StatusDot status={c.status} /></td>
                    {/* Action */}
                    <td className="py-3.5 pl-4 pr-0">
                      <ApproveButton companyId={c.id} companyName={c.name} onApproved={() => handleApproved(c.id)} />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${c.id}-card`}>
                      <td colSpan={COLS.length} className="px-4 pb-4 pt-1">
                        <ClientCardContent data={toCardData(c)} />
                        <RegenPanel
                          companyId={c.id}
                          onDone={() => {
                            setExpanded(prev => { const n = new Set(prev); n.delete(c.id); return n })
                          }}
                        />
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
