'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  FileText, Loader2, Mail, CheckCircle2, AlertCircle,
  ChevronDown, ChevronRight, Building2, ExternalLink, BarChart2, ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContentItem {
  id: string
  company_id: string
  email_subject: string | null
  email_body: string | null
  page_url: string | null
  report_url: string | null
  page_status: string | null
  report_status: string | null
  created_at: string
  companies?: { name: string; industry: string | null; status: string | null }
}

type GenStatus = 'idle' | 'loading' | 'done' | 'no_pending' | 'error'

function ContentCard({ item, onApproved }: { item: ContentItem; onApproved: (id: string) => void }) {
  const [open, setOpen]           = useState(false)
  const [approving, setApproving] = useState(false)

  async function moveToApproval() {
    setApproving(true)
    try {
      await fetch('/api/generate-content/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: item.company_id }),
      })
      onApproved(item.id)
    } finally {
      setApproving(false)
    }
  }

  return (
    <div className="border border-gray-100 rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        {open ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
        <Building2 size={14} className="text-gray-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">
            {item.companies?.name ?? 'חברה לא ידועה'}
          </p>
          {item.email_subject && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{item.email_subject}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {item.companies?.industry && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {item.companies.industry}
            </span>
          )}
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 size={10} /> נוצר
          </span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
          {(item.page_url || item.report_url) && (
            <div className="flex items-center gap-2 flex-wrap">
              {item.page_url && (
                <a href={item.page_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                  <ExternalLink size={11} /> עמוד הדגמה
                </a>
              )}
              {item.report_url && (
                <a href={item.report_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors">
                  <BarChart2 size={11} /> דוח מחקר
                </a>
              )}
            </div>
          )}
          {item.email_subject && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">נושא</p>
              <p className="text-sm font-medium text-gray-800">{item.email_subject}</p>
            </div>
          )}
          {item.email_body && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">גוף המייל</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.email_body}</p>
            </div>
          )}
          <div className="pt-1 border-t border-gray-50">
            <button
              onClick={moveToApproval}
              disabled={approving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-semibold transition-colors"
            >
              {approving
                ? <><Loader2 size={12} className="animate-spin" /> מעביר...</>
                : <><ArrowRight size={12} /> שלח לאישור</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function ContentBoard() {
  const [items, setItems]           = useState<ContentItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [status, setStatus]         = useState<GenStatus>('idle')
  const [statusStep, setStatusStep] = useState(0)
  const [statusMsg, setStatusMsg]   = useState<string | null>(null)
  const [lastName, setLastName]     = useState<string | null>(null)
  const [errorMsg, setErrorMsg]     = useState<string | null>(null)
  const [queueLeft, setQueueLeft]   = useState<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const loadContent = useCallback(async () => {
    setLoadingList(true)
    try {
      const res  = await fetch('/api/generate-content/list')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => { loadContent() }, [loadContent])

  async function createNext() {
    if (status === 'loading') return

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setStatus('loading')
    setStatusStep(0)
    setStatusMsg('מתחיל...')
    setLastName(null)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/generate-content/next?stream=true', {
        method: 'POST',
        signal: ctrl.signal,
      })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.error === 'no_credits'
          ? 'אין קרדיטים ב-Anthropic API'
          : (data.error ?? 'שגיאה'))
        setStatus('error')
        setTimeout(() => { setStatus('idle'); setErrorMsg(null) }, 5000)
        return
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          if (!part.trim()) continue
          let eventType = ''
          let eventData = ''
          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) eventType = line.slice(7)
            else if (line.startsWith('data: ')) eventData = line.slice(6)
          }
          if (!eventType || !eventData) continue

          try {
            const payload = JSON.parse(eventData)

            if (eventType === 'progress') {
              setStatusStep(payload.step ?? 0)
              setStatusMsg(payload.message ?? null)
            } else if (eventType === 'done') {
              if (payload.message === 'no_pending') {
                setStatus('no_pending')
              } else {
                setLastName(payload.company?.name ?? null)
                setQueueLeft(payload.queue_remaining ?? null)
                setStatus('done')
                await loadContent()
              }
              setTimeout(() => { setStatus('idle'); setStatusMsg(null) }, 5000)
            } else if (eventType === 'error') {
              setErrorMsg(payload.error === 'no_credits'
                ? 'אין קרדיטים ב-Anthropic API'
                : (payload.error ?? 'שגיאה'))
              setStatus('error')
              setTimeout(() => { setStatus('idle'); setErrorMsg(null) }, 5000)
            }
          } catch { /* ignore malformed SSE */ }
        }
      }
    } catch (e: unknown) {
      if ((e as Error)?.name === 'AbortError') return
      setErrorMsg('שגיאת רשת — נסה שוב')
      setStatus('error')
      setTimeout(() => { setStatus('idle'); setErrorMsg(null) }, 5000)
    }
  }

  const TOTAL_STEPS = 4

  const btnLabel =
    status === 'loading'    ? 'יוצר...' :
    status === 'done'       ? '✓ נוצר' :
    status === 'no_pending' ? 'אין בתור' :
    status === 'error'      ? 'שגיאה' :
                              'Create'

  const btnClass =
    status === 'loading'    ? 'bg-indigo-400 cursor-wait' :
    status === 'done'       ? 'bg-emerald-500 cursor-default' :
    status === 'no_pending' ? 'bg-gray-400 cursor-default' :
    status === 'error'      ? 'bg-red-500 cursor-default' :
                              'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'

  return (
    <div className="px-10 pt-8 pb-12">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Generation</h1>
          <p className="text-sm text-gray-400 mt-1">
            AI-generated email drafts for potential clients · in queue order
          </p>
        </div>

        <button
          onClick={createNext}
          disabled={status === 'loading' || status === 'done' || status === 'no_pending'}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors',
            btnClass
          )}
        >
          {status === 'loading'
            ? <><Loader2 size={15} className="animate-spin" /> יוצר תוכן...</>
            : <><FileText size={15} /> {btnLabel}</>}
        </button>
      </div>

      {/* ── Progress panel (visible while loading) ── */}
      {status === 'loading' && (
        <div className="mt-5 border border-indigo-100 rounded-2xl bg-indigo-50/40 p-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-100 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-indigo-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-indigo-700 transition-all duration-300">
                {statusMsg ?? 'מתחיל...'}
              </p>
              <p className="text-xs text-gray-400 mt-1">הסוכן עובד, זה יכול לקחת כמה שניות</p>
            </div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(step => (
                <div
                  key={step}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500',
                    statusStep >= step ? 'w-5 bg-indigo-400' : 'w-1.5 bg-gray-200'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Status bar (done / error / no_pending) ── */}
      {status !== 'idle' && status !== 'loading' && (
        <div className={cn(
          'mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm',
          status === 'done'       ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
          status === 'no_pending' ? 'bg-gray-50 text-gray-500 border border-gray-100' :
                                    'bg-red-50 text-red-600 border border-red-100'
        )}>
          {status === 'done'    && <CheckCircle2 size={15} className="shrink-0 mt-0.5" />}
          {status === 'error'   && <AlertCircle  size={15} className="shrink-0 mt-0.5" />}
          <span>
            {status === 'done'       && <>נוצר תוכן עבור <strong>{lastName}</strong>{queueLeft != null && queueLeft > 0 ? ` · נשארו ${queueLeft} בתור` : ' · אין עוד בתור'}</>}
            {status === 'no_pending' && 'כל הלקוחות הפוטנציאליים כבר קיבלו תוכן'}
            {status === 'error'      && (errorMsg ?? 'שגיאה — נסה שוב')}
          </span>
        </div>
      )}

      {/* ── Content list ── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            תוכן שנוצר
            {items.length > 0 && <span className="text-indigo-500 ml-1">{items.length}</span>}
          </p>
        </div>

        {loadingList ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
            <Loader2 size={16} className="animate-spin" /> טוען...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center text-center text-gray-400 py-20">
            <Mail size={32} className="mb-3 opacity-20" />
            <p className="text-sm">עוד לא נוצר תוכן</p>
            <p className="text-xs mt-1 opacity-60">לחץ Create כדי לייצר את האימייל הראשון</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <ContentCard
                key={item.id}
                item={item}
                onApproved={(id) => setItems(prev => prev.filter(i => i.id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
