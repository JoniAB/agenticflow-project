'use client'

import { useState, useEffect } from 'react'
import { PauseCircle, ChevronDown, ChevronRight, Loader2, ArrowRight } from 'lucide-react'
import { StatusDot } from '@/components/ui/StatusDot'
import { formatRelativeDate, cn } from '@/lib/utils'
import { useSelection } from '@/components/providers/SelectionProvider'
import { ClientCardTableRow } from '@/components/boards/ClientCard'
import type { CompanyStatus } from '@/lib/types'

interface StandbyCompany {
  id: string
  name: string
  industry: string | null
  domain: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  notes: string | null
  score: number | null
  status: CompanyStatus
  created_at: string
  updated_at: string
}

const COLS = ['', 'Company', 'Industry', 'Contact', 'Moved', 'Status', '']

export function StandbyBoard({ companies }: { companies: StandbyCompany[] }) {
  const [localRows, setLocalRows] = useState<StandbyCompany[]>(companies)
  const [expanded,  setExpanded]  = useState<Set<string>>(new Set())
  const [restoring, setRestoring] = useState<string | null>(null)
  const { selected, toggle, selectAll, clear } = useSelection()

  useEffect(() => { setLocalRows(companies) }, [companies])

  useEffect(() => {
    function onMoved(e: Event) {
      const ids = new Set((e as CustomEvent<{ ids: string[] }>).detail.ids)
      setLocalRows(prev => prev.filter(c => !ids.has(c.id)))
    }
    window.addEventListener('board-items-moved', onMoved)
    return () => window.removeEventListener('board-items-moved', onMoved)
  }, [])

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function restore(id: string) {
    setRestoring(id)
    try {
      await fetch(`/api/companies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Agent-Key': 'yoni-agent-key-2025' },
        body: JSON.stringify({ status: 'potential' }),
      })
      setLocalRows(prev => prev.filter(c => c.id !== id))
    } finally {
      setRestoring(null)
    }
  }

  return (
    <div className="px-10 pt-8 pb-12">
      <div className="flex items-center gap-3 mb-1">
        <PauseCircle size={22} className="text-amber-500" />
        <h1 className="text-2xl font-bold text-gray-900">Standby</h1>
      </div>
      <p className="text-sm text-gray-400 mt-1">Leads temporarily paused — restore to Prospect Research when ready</p>

      <div className="mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-7 pb-3 pl-0 pr-1">
                <input
                  type="checkbox"
                  checked={localRows.length > 0 && localRows.every(c => selected.has(c.id))}
                  onChange={e => e.target.checked ? selectAll(localRows.map(c => c.id)) : clear()}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-400"
                />
              </th>
              {COLS.map((h, i) => (
                <th key={i} className="text-left pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider first:pl-0 last:pr-0 px-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {localRows.length === 0 ? (
              <tr>
                <td colSpan={COLS.length + 1} className="py-16 text-center text-sm text-gray-400">
                  No leads in Standby
                </td>
              </tr>
            ) : localRows.map((c, i) => {
              const isExpanded = expanded.has(c.id)
              const isLast     = i === localRows.length - 1
              return (
                <>
                  <tr
                    key={c.id}
                    className={cn(
                      'group hover:bg-gray-50 transition-colors',
                      !isExpanded && !isLast && 'border-b border-gray-100'
                    )}
                  >
                    <td className="py-3.5 pl-0 pr-1 w-7">
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggle(c.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-400"
                      />
                    </td>
                    <td className="py-3.5 pl-0 pr-2 w-6">
                      <button
                        onClick={() => toggleExpand(c.id)}
                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </td>
                    <td className="py-3.5 pl-0 pr-4">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      {c.domain && <p className="text-xs text-gray-400 mt-0.5">{c.domain.replace(/^https?:\/\//, '').split('/')[0]}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">{c.industry ?? '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">
                      {c.contact_name ?? '—'}
                      {c.contact_phone && <span className="block text-gray-400">{c.contact_phone}</span>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {formatRelativeDate(c.updated_at)}
                    </td>
                    <td className="px-4 py-3.5"><StatusDot status={c.status} /></td>
                    <td className="py-3.5 pl-4 pr-0">
                      <button
                        onClick={() => restore(c.id)}
                        disabled={restoring === c.id}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-40"
                      >
                        {restoring === c.id ? <Loader2 size={11} className="animate-spin" /> : <ArrowRight size={11} />}
                        Restore
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <ClientCardTableRow
                      key={`${c.id}-exp`}
                      colSpan={COLS.length + 1}
                      data={{
                        notes:         c.notes,
                        contact_name:  c.contact_name,
                        contact_email: c.contact_email,
                        contact_phone: c.contact_phone,
                        domain:        c.domain,
                      }}
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
