'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, GitMerge, X, Loader2, ArrowUpRight, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BOARDS } from '@/components/ui/MoveToBoardMenu'
import { useSelection } from '@/components/providers/SelectionProvider'

type ActionStatus = 'idle' | 'loading'

export function BulkActionBar() {
  const { selected, clear } = useSelection()
  const router = useRouter()
  const [status,       setStatus]       = useState<ActionStatus>('idle')
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [showMove,     setShowMove]     = useState(false)

  const count = selected.size
  if (count === 0) return null

  async function performAction(action: 'delete' | 'merge' | 'set_status', payload?: string) {
    if (status === 'loading') return
    const ids = [...selected]
    if (action === 'delete' && !confirm(`למחוק ${count} לידים? פעולה זו אינה הפיכה.`)) return

    setStatus('loading')
    setActiveAction(action === 'set_status' ? payload ?? action : action)

    try {
      const body: Record<string, unknown> = { action, ids }
      if (action === 'merge')      body.keep_id = ids[0]
      if (action === 'set_status') body.status  = payload

      const res = await fetch('/api/companies/bulk', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      if (!res.ok) throw new Error()

      setShowMove(false)
      clear()
      window.dispatchEvent(new CustomEvent('board-items-moved', { detail: { ids } }))
      window.dispatchEvent(new CustomEvent('boards-refresh'))
      router.refresh()

      if (action === 'set_status' && payload === 'content_ready') {
        for (const id of ids) {
          fetch(`/api/generate-content/next?company_id=${id}`, { method: 'POST' }).catch(() => {})
        }
      }
    } catch {
      alert('שגיאה — נסה שוב')
    } finally {
      setStatus('idle')
      setActiveAction(null)
    }
  }

  function isLoading(key: string) {
    return status === 'loading' && activeAction === key
  }

  const mainBoards = BOARDS.filter(b => !b.section)
  const mailBoards = BOARDS.filter(b => b.section === 'Mail')

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1">

      {/* Board picker — appears above the bar */}
      {showMove && (
        <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden w-56">
          <div className="px-3 pt-2.5 pb-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">העבר לבורד</p>
          </div>
          {mainBoards.map(dest => (
            <button
              key={dest.status}
              onClick={() => performAction('set_status', dest.status)}
              disabled={status === 'loading'}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-200 hover:bg-white/10 transition-colors disabled:opacity-50 text-left"
            >
              {isLoading(dest.status)
                ? <Loader2 size={11} className="animate-spin text-indigo-300 shrink-0" />
                : <span className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />}
              {dest.label}
            </button>
          ))}
          {mailBoards.length > 0 && (
            <>
              <div className="mx-3 my-1 border-t border-gray-700" />
              <div className="px-3 pb-0.5">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Mail</p>
              </div>
              {mailBoards.map(dest => (
                <button
                  key={dest.status}
                  onClick={() => performAction('set_status', dest.status)}
                  disabled={status === 'loading'}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-200 hover:bg-white/10 transition-colors disabled:opacity-50 text-left"
                >
                  {isLoading(dest.status)
                    ? <Loader2 size={11} className="animate-spin text-indigo-300 shrink-0" />
                    : <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />}
                  {dest.label}
                </button>
              ))}
            </>
          )}
          <div className="h-2" />
        </div>
      )}

      {/* Main action bar */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-2xl',
        'shadow-2xl border border-gray-700 bg-gray-900 text-white',
      )}>
        <span className="text-sm font-semibold text-white/90">
          {count} {count === 1 ? 'ליד' : 'לידים'} נבחרו
        </span>

        <div className="w-px h-4 bg-white/20" />

        {/* Move to board */}
        <button
          onClick={() => setShowMove(v => !v)}
          disabled={status === 'loading'}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50',
            showMove
              ? 'bg-indigo-600 text-white'
              : 'bg-white/10 hover:bg-white/20 text-white'
          )}
        >
          {showMove ? <ChevronUp size={12} /> : <ArrowUpRight size={12} />}
          העבר לבורד
        </button>

        {count >= 2 && (
          <button
            onClick={() => performAction('merge')}
            disabled={status === 'loading'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-xs font-semibold transition-colors"
          >
            {isLoading('merge') ? <Loader2 size={12} className="animate-spin" /> : <GitMerge size={12} />}
            מיזוג
          </button>
        )}

        <button
          onClick={() => performAction('delete')}
          disabled={status === 'loading'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-xs font-semibold transition-colors"
        >
          {isLoading('delete') ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          מחק
        </button>

        <button onClick={clear} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <X size={14} className="text-white/60" />
        </button>
      </div>
    </div>
  )
}
