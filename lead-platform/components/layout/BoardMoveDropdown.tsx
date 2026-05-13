'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, ChevronDown, Loader2, Trash2, AlertCircle } from 'lucide-react'
import { useSelection } from '@/components/providers/SelectionProvider'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const MAIN_BOARDS = [
  { label: 'Prospect Research',  status: 'potential'         },
  { label: 'Potential Clients',  status: 'high_score'        },
  { label: 'Content Generation', status: 'content_ready'     },
  { label: 'Ready to Send',      status: 'awaiting_approval' },
  { label: 'Client History',     status: 'exhausted'         },
  { label: 'Standby',            status: 'standby'           },
]

const MAIL_BOARDS = [
  { label: 'Sent',      status: 'sent'         },
  { label: 'Follow-up', status: 'followup_sent' },
  { label: 'Inbox',     status: 'replied'       },
]

const MENU_W = 220

export function BoardMoveDropdown() {
  const { selected, clear } = useSelection()
  const router   = useRouter()
  const btnRef   = useRef<HTMLButtonElement>(null)
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [err,     setErr]     = useState<string | null>(null)
  const [pos,     setPos]     = useState<{ top: number; left: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      const menu = document.getElementById('board-move-dd')
      if (menu?.contains(e.target as Node)) return
      if (btnRef.current?.contains(e.target as Node)) return
      setOpen(false)
      setErr(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const active = selected.size > 0

  function handleToggle() {
    if (!active) return
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 6, left: r.left })
    }
    setOpen(v => !v)
    setErr(null)
  }

  async function moveTo(status: string) {
    if (loading) return
    const ids = [...selected]
    setLoading(status)
    setErr(null)
    try {
      const res  = await fetch('/api/companies/bulk', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'set_status', status, ids }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr((body as { error?: string }).error ?? `Error ${res.status}`)
        return
      }
      setOpen(false)
      clear()
      window.dispatchEvent(new CustomEvent('board-items-moved', { detail: { ids } }))
      window.dispatchEvent(new CustomEvent('boards-refresh'))
      router.refresh()

      // Auto-trigger content generation for each moved lead (fire-and-forget)
      if (status === 'content_ready') {
        for (const id of ids) {
          fetch(`/api/generate-content/next?company_id=${id}`, { method: 'POST' }).catch(() => {})
        }
      }
    } finally {
      setLoading(null)
    }
  }

  async function deleteAll() {
    if (loading) return
    if (!confirm(`למחוק ${selected.size} לידים? פעולה זו אינה הפיכה.`)) return
    const ids = [...selected]
    setLoading('delete')
    setErr(null)
    try {
      const res  = await fetch('/api/companies/bulk', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'delete', ids }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr((body as { error?: string }).error ?? `Error ${res.status}`)
        return
      }
      setOpen(false)
      clear()
      window.dispatchEvent(new CustomEvent('board-items-moved', { detail: { ids } }))
      window.dispatchEvent(new CustomEvent('boards-refresh'))
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  const dropdown = open && pos && mounted ? createPortal(
    <div
      id="board-move-dd"
      style={{ position: 'fixed', top: pos.top, left: pos.left, width: MENU_W, zIndex: 9999 }}
      className="bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5"
    >
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-0.5 pb-1.5">
        העבר לבורד
      </p>

      {err && (
        <div className="mx-3 mb-1.5 flex items-center gap-1.5 text-xs text-red-500 bg-red-50 rounded-lg px-2 py-1.5">
          <AlertCircle size={11} className="shrink-0" />
          {err}
        </div>
      )}

      {MAIN_BOARDS.map(dest => (
        <button
          key={dest.status}
          onClick={() => moveTo(dest.status)}
          disabled={!!loading}
          className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors disabled:opacity-60"
        >
          {loading === dest.status
            ? <Loader2 size={10} className="animate-spin text-indigo-400 shrink-0" />
            : <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />}
          {dest.label}
        </button>
      ))}

      <div className="mx-3 my-1 border-t border-gray-100" />
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pb-1">Mail</p>
      {MAIL_BOARDS.map(dest => (
        <button
          key={dest.status}
          onClick={() => moveTo(dest.status)}
          disabled={!!loading}
          className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors disabled:opacity-60"
        >
          {loading === dest.status
            ? <Loader2 size={10} className="animate-spin text-indigo-400 shrink-0" />
            : <span className="w-1.5 h-1.5 rounded-full bg-indigo-200 shrink-0" />}
          {dest.label}
        </button>
      ))}

      <div className="mx-3 my-1 border-t border-gray-100" />
      <button
        onClick={deleteAll}
        disabled={!!loading}
        className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-60"
      >
        {loading === 'delete'
          ? <Loader2 size={10} className="animate-spin text-red-400 shrink-0" />
          : <Trash2 size={12} className="shrink-0" />}
        מחק
      </button>
    </div>,
    document.body,
  ) : null

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleToggle}
        disabled={!active}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-colors',
          active
            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
            : 'text-[#3D4060] cursor-default'
        )}
      >
        <ArrowUpRight size={15} strokeWidth={1.8} className="shrink-0" />
        <span className="flex-1 text-left">העבר לבורד</span>
        {active && (
          <span className="text-[11px] font-semibold bg-white/20 rounded-full px-1.5 tabular-nums">
            {selected.size}
          </span>
        )}
        {active && <ChevronDown size={12} className="shrink-0 opacity-70" />}
      </button>
      {dropdown}
    </>
  )
}
