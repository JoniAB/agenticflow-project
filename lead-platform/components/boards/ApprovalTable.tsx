'use client'

import { useState } from 'react'
import { Company, Content } from '@/lib/types'
import { StatusDot } from '@/components/ui/StatusDot'
import { ApproveButton } from '@/components/boards/ApproveButton'
import { ClientCardTableRow, type ClientCardData } from '@/components/boards/ClientCard'
import { formatRelativeDate, cn } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'

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
                        ? <p className="font-medium text-gray-800 truncate">{c.content.email_subject}</p>
                        : <span className="text-gray-400">—</span>}
                      {c.content?.email_body && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">
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
