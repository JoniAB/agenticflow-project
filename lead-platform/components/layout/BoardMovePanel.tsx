'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'
import { useSelection } from '@/components/providers/SelectionProvider'
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

export function BoardMovePanel() {
  const { selected, clear } = useSelection()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const active = selected.size > 0

  async function moveTo(status: string) {
    if (!active || loading) return
    const ids = [...selected]
    setLoading(status)
    try {
      const res = await fetch('/api/companies/bulk', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'set_status', status, ids }),
      })
      if (res.ok) { clear(); window.dispatchEvent(new CustomEvent('boards-refresh')); router.refresh() }
    } finally {
      setLoading(null)
    }
  }

  async function deleteAll() {
    if (!active || loading) return
    if (!confirm(`למחוק ${selected.size} לידים? פעולה זו אינה הפיכה.`)) return
    const ids = [...selected]
    setLoading('delete')
    try {
      const res = await fetch('/api/companies/bulk', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'delete', ids }),
      })
      if (res.ok) { clear(); window.dispatchEvent(new CustomEvent('boards-refresh')); router.refresh() }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="w-[200px] h-full bg-white border-r border-gray-100 flex flex-col select-none">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          העבר לבורד
        </p>
      </div>

      {/* Board list */}
      <div className={cn('flex-1 overflow-y-auto', !active && 'opacity-35 pointer-events-none')}>
        <div className="px-2 space-y-0.5">
          {MAIN_BOARDS.map(dest => (
            <button
              key={dest.status}
              onClick={() => moveTo(dest.status)}
              disabled={!!loading}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-2.5 transition-colors group',
                loading === dest.status
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'hover:bg-indigo-50 hover:text-indigo-700'
              )}
            >
              {loading === dest.status
                ? <Loader2 size={10} className="animate-spin text-indigo-400 shrink-0" />
                : <span className="w-[7px] h-[7px] rounded-full bg-gray-300 group-hover:bg-indigo-400 shrink-0 transition-colors" />}
              {dest.label}
            </button>
          ))}
        </div>

        <div className="mx-4 my-2 border-t border-gray-100" />

        {/* Mail section */}
        <div className="px-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
            Mail
          </p>
          <div className="space-y-0.5">
            {MAIL_BOARDS.map(dest => (
              <button
                key={dest.status}
                onClick={() => moveTo(dest.status)}
                disabled={!!loading}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-2.5 transition-colors group',
                  loading === dest.status
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'hover:bg-indigo-50 hover:text-indigo-700'
                )}
              >
                {loading === dest.status
                  ? <Loader2 size={10} className="animate-spin text-indigo-400 shrink-0" />
                  : <span className="w-[7px] h-[7px] rounded-full bg-indigo-200 group-hover:bg-indigo-400 shrink-0 transition-colors" />}
                {dest.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-4 my-2 border-t border-gray-100" />

        {/* Delete */}
        <div className="px-2 pb-4">
          <button
            onClick={deleteAll}
            disabled={!!loading}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 flex items-center gap-2.5 hover:bg-red-50 transition-colors"
          >
            {loading === 'delete'
              ? <Loader2 size={10} className="animate-spin text-red-400 shrink-0" />
              : <Trash2 size={12} className="shrink-0" />}
            מחק
          </button>
        </div>
      </div>
    </div>
  )
}
