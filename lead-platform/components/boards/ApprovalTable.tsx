'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Company, Content } from '@/lib/types'
import { StatusDot } from '@/components/ui/StatusDot'
import { ApproveButton } from '@/components/boards/ApproveButton'
import { formatRelativeDate, cn } from '@/lib/utils'
import { ExternalLink, Mail } from 'lucide-react'

type ApprovalRow = Company & { content: Content | null }
type Filter = 'all' | 'deployed' | 'draft'

const TABS: { value: Filter; label: string }[] = [
  { value: 'all',      label: 'All'       },
  { value: 'deployed', label: 'Page Live' },
  { value: 'draft',    label: 'Draft'     },
]

const COLS = ['Company', 'Vercel Page', 'Email Subject', 'Added', 'Status', 'Action']

export function ApprovalTable({ companies }: { companies: ApprovalRow[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const router = useRouter()

  const rows = filter === 'all' ? companies
    : companies.filter(c => filter === 'deployed'
        ? c.content?.page_status === 'deployed'
        : c.content?.page_status !== 'deployed')

  return (
    <div className="px-10 pt-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">Pending Approval</h1>
      <p className="text-sm text-gray-400 mt-1">Review content before the sending agent dispatches emails</p>

      <div className="flex items-center gap-1 mt-5">
        {TABS.map(tab => {
          const count = tab.value === 'all' ? companies.length
            : companies.filter(c => tab.value === 'deployed'
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
              {COLS.map(h => (
                <th key={h} className="text-left pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider first:pl-0 last:pr-0 px-4">
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
            ) : rows.map((c, i) => (
              <tr key={c.id} onClick={() => router.push(`/boards/lead/${c.id}`)} className={cn('group hover:bg-gray-50 transition-colors cursor-pointer', i !== rows.length - 1 && 'border-b border-gray-100')}>
                {/* Company */}
                <td className="py-3.5 pl-0 pr-4">
                  <p className="font-medium text-gray-900">{c.name}</p>
                  {c.industry && <p className="text-xs text-gray-400 mt-0.5">{c.industry}</p>}
                </td>
                {/* Page + Report */}
                <td className="px-4 py-3.5">
                  <div className="flex flex-col gap-1">
                    {c.content?.page_url ? (
                      <a href={c.content.page_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                        <ExternalLink size={12} /> View Page
                      </a>
                    ) : <span className="text-gray-400">—</span>}
                    {c.content?.report_url && (
                      <a href={c.content.report_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-700 font-medium text-sm">
                        <ExternalLink size={12} /> View Report
                      </a>
                    )}
                  </div>
                </td>
                {/* Email */}
                <td className="px-4 py-3.5 max-w-[240px]">
                  {c.content?.email_subject ? (
                    <div>
                      <p className="font-medium text-gray-800 truncate flex items-center gap-1">
                        <Mail size={11} className="text-gray-400 shrink-0" />
                        {c.content.email_subject}
                      </p>
                      {c.content.email_body && (
                        <p className="text-xs text-gray-400 truncate mt-0.5 pl-4">
                          {c.content.email_body.slice(0, 70)}…
                        </p>
                      )}
                    </div>
                  ) : <span className="text-gray-400">—</span>}
                </td>
                {/* Added */}
                <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                  {formatRelativeDate(c.updated_at)}
                </td>
                {/* Status */}
                <td className="px-4 py-3.5"><StatusDot status={c.status} /></td>
                {/* Action */}
                <td className="py-3.5 pl-4 pr-0" onClick={e => e.stopPropagation()}>
                  <ApproveButton companyId={c.id} companyName={c.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
