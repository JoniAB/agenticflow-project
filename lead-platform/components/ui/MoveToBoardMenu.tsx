'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const BOARDS = [
  { label: 'Prospect Research',  status: 'potential',         section: null   },
  { label: 'Potential Clients',  status: 'high_score',        section: null   },
  { label: 'Content Generation', status: 'content_ready',     section: null   },
  { label: 'Ready to Send',      status: 'awaiting_approval', section: null   },
  { label: 'Sent',               status: 'sent',              section: 'Mail' },
  { label: 'Follow-up',          status: 'followup_sent',     section: 'Mail' },
  { label: 'Inbox',              status: 'replied',           section: 'Mail' },
  { label: 'Client History',     status: 'exhausted',         section: null   },
  { label: 'Standby',            status: 'standby',           section: null   },
]

interface MoveToBoardMenuProps {
  companyId: string
  currentStatus?: string
  onMoved: () => void
  className?: string
}

const MENU_W = 208

export function MoveToBoardMenu({ companyId, currentStatus, onMoved, className }: MoveToBoardMenuProps) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [pos,     setPos]     = useState<{ top: number; left: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      const menu = document.getElementById('move-board-portal')
      if (menu && menu.contains(e.target as Node)) return
      if (btnRef.current && btnRef.current.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      // Position menu below button, aligned so right edge matches button right edge
      const left = Math.max(4, r.right - MENU_W)
      setPos({ top: r.bottom + 4, left })
    }
    setOpen(v => !v)
  }

  async function moveTo(status: string, e: React.MouseEvent) {
    e.stopPropagation()
    setLoading(status)
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Agent-Key': 'yoni-agent-key-2025' },
        body:    JSON.stringify({ status }),
      })
      if (res.ok) { setOpen(false); onMoved() }
    } finally {
      setLoading(null)
    }
  }

  const mainBoards = BOARDS.filter(b => !b.section && b.status !== currentStatus)
  const mailBoards = BOARDS.filter(b => b.section === 'Mail' && b.status !== currentStatus)

  const dropdown = open && pos && mounted ? createPortal(
    <div
      id="move-board-portal"
      style={{ position: 'fixed', top: pos.top, left: pos.left, width: MENU_W, zIndex: 9999 }}
      className="bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5"
      onClick={e => e.stopPropagation()}
    >
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pb-1.5 pt-0.5">
        העבר לבורד
      </p>
      {mainBoards.map(dest => (
        <button
          key={dest.status}
          onClick={e => moveTo(dest.status, e)}
          disabled={!!loading}
          className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors disabled:opacity-60"
        >
          {loading === dest.status
            ? <Loader2 size={11} className="animate-spin text-indigo-400 shrink-0" />
            : <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />}
          {dest.label}
        </button>
      ))}

      {mailBoards.length > 0 && (
        <>
          <div className="mx-3 my-1 border-t border-gray-100" />
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pb-1">Mail</p>
          {mailBoards.map(dest => (
            <button
              key={dest.status}
              onClick={e => moveTo(dest.status, e)}
              disabled={!!loading}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading === dest.status
                ? <Loader2 size={11} className="animate-spin text-indigo-400 shrink-0" />
                : <span className="w-1.5 h-1.5 rounded-full bg-indigo-200 shrink-0" />}
              {dest.label}
            </button>
          ))}
        </>
      )}
    </div>,
    document.body,
  ) : null

  return (
    <div className={cn('relative', className)}>
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="p-1 rounded text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
        title="העבר לבורד"
      >
        <ArrowUpRight size={13} />
      </button>
      {dropdown}
    </div>
  )
}
