'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import Link from 'next/link'
import { Company, Content, CompanyStatus } from '@/lib/types'
import { STATUS_CONFIG } from '@/lib/status-config'
import { formatDate, cn } from '@/lib/utils'
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react'

type ExtendedCompany = Company & {
  score_reasoning?: string
  email_address?: string
  page_url?: string
  email_subject?: string
  email_body?: string
}

interface LeadDetailProps {
  company: ExtendedCompany
  content: Content | null
}

const QUICK_STATUSES: CompanyStatus[] = ['new', 'potential', 'high_score']

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  )
}

export function LeadDetail({ company, content }: LeadDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const pageUrl = content?.page_url ?? company.page_url
  const emailSubject = content?.email_subject ?? company.email_subject
  const emailBody = content?.email_body ?? company.email_body

  function changeStatus(status: CompanyStatus) {
    startTransition(async () => {
      await fetch(`/api/companies/${company.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Agent-Key': process.env.NEXT_PUBLIC_AGENT_KEY ?? '',
        },
        body: JSON.stringify({ status }),
      })
      router.refresh()
    })
  }

  const boardPath = ['sent', 'replied', 'followup_sent'].includes(company.status)
    ? '/boards/outreach'
    : ['awaiting_approval', 'awaiting_followup_approval', 'approved', 'edit_required'].includes(company.status)
    ? '/boards/approval'
    : '/boards/champions'

  const boardLabel = ['sent', 'replied', 'followup_sent'].includes(company.status)
    ? 'Outreach'
    : ['awaiting_approval', 'awaiting_followup_approval', 'approved', 'edit_required'].includes(company.status)
    ? 'Ready to Send'
    : 'Prospect Research'

  return (
    <div className="px-10 pt-8 pb-16 max-w-4xl">
      {/* Back */}
      <Link href={boardPath}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6">
        <ArrowLeft size={14} />
        Back to {boardLabel}
      </Link>

      {/* Title + status buttons */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>

        <div className="flex items-center gap-1.5 shrink-0">
          {isPending && <Loader2 size={14} className="animate-spin text-gray-400" />}
          {QUICK_STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s]
            const isActive = company.status === s
            return (
              <button key={s} onClick={() => changeStatus(s)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-all border',
                  isActive
                    ? `${cfg.bg} ${cfg.text} ${cfg.ring} border-transparent ring-2`
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
                )}>
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Info card */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-x-12 gap-y-5">
          <InfoRow label="Company">{company.name}</InfoRow>
          <InfoRow label="Industry">{company.industry ?? '—'}</InfoRow>

          <InfoRow label="Website">
            {pageUrl ? (
              <a href={pageUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700">
                {pageUrl.replace('https://', '')} <ExternalLink size={11} />
              </a>
            ) : '—'}
          </InfoRow>

          <InfoRow label="LinkedIn">
            {company.linkedin_url ? (
              <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700">
                {company.linkedin_url.replace('https://', '')} <ExternalLink size={11} />
              </a>
            ) : '—'}
          </InfoRow>

          <InfoRow label="Size">{company.size_estimate ?? '—'} employees</InfoRow>

          <InfoRow label="Score">
            <span className="text-xl font-bold" style={{
              color: company.score <= 2 ? '#22C55E' : company.score <= 4 ? '#F59E0B' : '#EF4444'
            }}>
              {company.score}
            </span>
            <span className="text-gray-400 text-sm"> / 10</span>
          </InfoRow>

          {company.score_reasoning && (
            <div className="col-span-2">
              <InfoRow label="Score Reasoning">
                <p className="text-gray-600 leading-relaxed">{company.score_reasoning}</p>
              </InfoRow>
            </div>
          )}

          <InfoRow label="Source">
            {company.source === 'linkedin' ? 'LinkedIn Search'
              : company.source === 'google_maps' ? 'Google Maps'
              : 'Other'}
          </InfoRow>

          <InfoRow label="Status">
            <span className={cn(
              'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
              STATUS_CONFIG[company.status]?.bg,
              STATUS_CONFIG[company.status]?.text
            )}>
              <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_CONFIG[company.status]?.dot)} />
              {STATUS_CONFIG[company.status]?.label}
            </span>
          </InfoRow>

          <InfoRow label="Created">{formatDate(company.created_at)}</InfoRow>

          <InfoRow label="Agent">
            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
              agent_scorer
            </span>
          </InfoRow>

          {company.email_address && (
            <div className="col-span-2">
              <InfoRow label="Email">
                <span className="text-gray-600">{company.email_address}</span>
              </InfoRow>
            </div>
          )}
        </div>
      </div>

      {/* Email preview */}
      {emailSubject && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Email Draft</p>
          <p className="font-semibold text-gray-900 text-sm mb-1">{emailSubject}</p>
          {emailBody && (
            <p className="text-sm text-gray-500 leading-relaxed">{emailBody}</p>
          )}
          {pageUrl && (
            <a href={pageUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700">
              <ExternalLink size={12} /> View demo page
            </a>
          )}
        </div>
      )}
    </div>
  )
}
