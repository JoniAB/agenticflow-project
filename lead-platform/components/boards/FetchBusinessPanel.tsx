'use client'

import { useState, useEffect } from 'react'
import { Users, Loader2, Globe, Phone } from 'lucide-react'
import { Tooltip } from '@/components/ui/Tooltip'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { cn } from '@/lib/utils'

interface PipelineCompany {
  id: string
  name: string
  domain?: string
  industry?: string
  contact_phone?: string
  score?: number
  created_at: string
  isNew?: boolean
}

function PipelineRow({ company }: { company: PipelineCompany }) {
  const [visible, setVisible] = useState(!company.isNew)

  useEffect(() => {
    if (company.isNew) {
      const t = setTimeout(() => setVisible(true), 30)
      return () => clearTimeout(t)
    }
  }, [company.isNew])

  return (
    <div className={cn(
      'flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-500',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
      company.isNew && visible
        ? 'ring-2 ring-indigo-200 border-indigo-100 bg-indigo-50/30'
        : 'border-gray-100 bg-white'
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 text-sm">{company.name}</span>
          {company.isNew && (
            <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">
              נוסף עכשיו
            </span>
          )}
        </div>
        {company.industry && <p className="text-xs text-gray-400 mt-0.5">{company.industry}</p>}
      </div>
      {company.score != null && (
        <div className="w-24 shrink-0"><ScoreBar score={company.score} /></div>
      )}
      <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
        {company.domain && (
          <span className="flex items-center gap-1">
            <Globe size={11} />{company.domain.replace(/^https?:\/\//, '').split('/')[0]}
          </span>
        )}
        {company.contact_phone && (
          <span className="flex items-center gap-1"><Phone size={11} />{company.contact_phone}</span>
        )}
      </div>
    </div>
  )
}

export function FetchBusinessPanel() {
  const [pipeline, setPipeline]         = useState<PipelineCompany[]>([])
  const [loadingPipeline, setLoading]   = useState(true)

  useEffect(() => {
    fetch('/api/companies?status=potential&limit=100')
      .then(r => r.json())
      .then(data => setPipeline(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="px-10 pt-8 pb-12">
      {/* Header */}
      <Tooltip text="לקוחות פוטנציאליים">
        <h1 className="text-2xl font-bold text-gray-900 cursor-default">Potential Clients</h1>
      </Tooltip>
      <Tooltip text="לידים שנחקרים לפני ניקוד">
        <p className="text-sm text-gray-400 mt-1 cursor-default">Leads being actively researched before scoring</p>
      </Tooltip>

      {/* Pipeline list */}
      <div className="mt-6">
        <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">
          בצנרת{pipeline.length > 0 && <span className="text-indigo-500 ml-1">{pipeline.length}</span>}
        </p>

        {loadingPipeline ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-12 justify-center">
            <Loader2 size={16} className="animate-spin" /> טוען...
          </div>
        ) : pipeline.length === 0 ? (
          <div className="flex flex-col items-center text-center text-gray-400 py-20">
            <Users size={32} className="mb-3 opacity-20" />
            <p className="text-sm">עדיין אין לקוחות בצנרת</p>
            <p className="text-xs mt-1 opacity-60">הוסף עסקים דרך Champions Board</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pipeline.map(company => (
              <PipelineRow key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
