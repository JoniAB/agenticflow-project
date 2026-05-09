'use client'

import { useState, useEffect } from 'react'
import {
  Users, Loader2, Globe, Phone, Trash2, ChevronDown, ChevronRight,
  Mail, User, Globe2, MessageCircle, Star, CalendarCheck, Image,
  CheckCircle2, XCircle,
} from 'lucide-react'
import { Tooltip } from '@/components/ui/Tooltip'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { cn } from '@/lib/utils'

interface PipelineCompany {
  id: string
  name: string
  domain?: string | null
  industry?: string | null
  contact_phone?: string | null
  contact_email?: string | null
  contact_name?: string | null
  notes?: string | null
  score?: number
  created_at: string
  isNew?: boolean
}

// ─── Digital asset detection (shared with ChampionsTable) ─────────────────────

interface AssetStatus { label: string; present: boolean; icon: React.ElementType }

function detectAssets(notes: string | null, domain: string | null): AssetStatus[] {
  const t = (notes ?? '').toLowerCase()
  const hasWebsite  = !!domain
  const hasWhatsApp = !t.includes('חסר whatsapp') && !t.includes('אין whatsapp') && !t.includes('ללא whatsapp') && !t.includes('אין כפתור whatsapp')
  const hasBooking  = !t.includes('אין תורים') && !t.includes('אין הזמנת') && !t.includes('לא ניתן לקבוע') && !t.includes('אין אפשרות לקבוע')
  const hasReviews  = (t.includes('ביקורות') || t.includes('כוכבים') || t.includes('stars')) && !t.includes('אין ביקורות') && !t.includes('אפס ביקורות')
  const hasSocial   = t.includes('אינסטגרם') || t.includes('פייסבוק') || t.includes('instagram') || t.includes('facebook') || t.includes('linkedin')
  const hasGallery  = !t.includes('אין גלריה') && !t.includes('אין תמונות') && !t.includes('מעט תמונות')
  return [
    { label: 'אתר',      present: hasWebsite,  icon: Globe2        },
    { label: 'WhatsApp', present: hasWhatsApp, icon: MessageCircle },
    { label: 'ביקורות', present: hasReviews,  icon: Star          },
    { label: 'הזמנה',   present: hasBooking,  icon: CalendarCheck },
    { label: 'סושיאל',  present: hasSocial,   icon: Image         },
    { label: 'גלריה',   present: hasGallery,  icon: Image         },
  ]
}

// ─── Expanded row ─────────────────────────────────────────────────────────────

function ExpandedRow({ company }: { company: PipelineCompany }) {
  const assets  = detectAssets(company.notes ?? null, company.domain ?? null)
  const missing = assets.filter(a => !a.present)
  const present = assets.filter(a => a.present)

  return (
    <div className="mx-0 mb-3 bg-gray-50 border border-gray-200 rounded-xl p-5 grid grid-cols-3 gap-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">למה נבחר</p>
        {company.notes
          ? <p className="text-sm text-gray-700 leading-relaxed">{company.notes}</p>
          : <p className="text-sm text-gray-400 italic">אין נתוני מחקר</p>}
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">פרטי קשר</p>
        <div className="space-y-1.5">
          {company.contact_name && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User size={13} className="text-gray-400 shrink-0" />{company.contact_name}
            </div>
          )}
          {company.contact_phone && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone size={13} className="text-gray-400 shrink-0" />
              <a href={`tel:${company.contact_phone}`} className="hover:text-indigo-600">{company.contact_phone}</a>
            </div>
          )}
          {company.contact_email && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail size={13} className="text-gray-400 shrink-0" />
              <a href={`mailto:${company.contact_email}`} className="hover:text-indigo-600 truncate">{company.contact_email}</a>
            </div>
          )}
          {company.domain && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Globe size={13} className="text-gray-400 shrink-0" />
              <a
                href={company.domain.startsWith('http') ? company.domain : `https://${company.domain}`}
                target="_blank" rel="noopener noreferrer"
                className="hover:text-indigo-600 truncate"
              >
                {company.domain.replace(/^https?:\/\//, '').split('/')[0]}
              </a>
            </div>
          )}
          {!company.contact_name && !company.contact_phone && !company.contact_email && !company.domain && (
            <p className="text-sm text-gray-400 italic">אין פרטי קשר</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">נכסים דיגיטליים</p>
        <div className="space-y-1.5">
          {missing.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-red-400 font-medium">חסר:</p>
              {missing.map(a => (
                <div key={a.label} className="flex items-center gap-1.5 text-xs text-red-500">
                  <XCircle size={12} className="shrink-0" />{a.label}
                </div>
              ))}
            </div>
          )}
          {present.length > 0 && (
            <div className="space-y-1 mt-1">
              <p className="text-[10px] text-emerald-500 font-medium">קיים:</p>
              {present.map(a => (
                <div key={a.label} className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <CheckCircle2 size={12} className="shrink-0" />{a.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Pipeline row ─────────────────────────────────────────────────────────────

function PipelineRow({
  company, onDelete, deleting, expanded, onToggle,
}: {
  company: PipelineCompany
  onDelete: (id: string, name: string) => void
  deleting: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const [visible, setVisible] = useState(!company.isNew)

  useEffect(() => {
    if (company.isNew) {
      const t = setTimeout(() => setVisible(true), 30)
      return () => clearTimeout(t)
    }
  }, [company.isNew])

  return (
    <div className={cn(
      'transition-all duration-500',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
    )}>
      <div className={cn(
        'group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300',
        expanded
          ? 'border-indigo-200 bg-indigo-50/30 rounded-b-none border-b-0'
          : company.isNew && visible
            ? 'ring-2 ring-indigo-200 border-indigo-100 bg-indigo-50/30'
            : 'border-gray-100 bg-white'
      )}>
        {/* Expand toggle */}
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

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
          {company.created_at && (
            <span className="text-[11px] text-gray-300 tabular-nums">
              {new Date(company.created_at).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' })}
            </span>
          )}
        </div>

        <button
          onClick={() => onDelete(company.id, company.name)}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40 shrink-0"
          title="מחק ליד"
        >
          {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
        </button>
      </div>

      {expanded && (
        <div className="border border-t-0 border-indigo-200 rounded-b-xl bg-white px-4 pb-1">
          <ExpandedRow company={company} />
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FetchBusinessPanel() {
  const [pipeline, setPipeline]   = useState<PipelineCompany[]>([])
  const [loadingPipeline, setLoading] = useState(true)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [expanded, setExpanded]   = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/companies?status=high_score&limit=100')
      .then(r => r.json())
      .then(data => setPipeline(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function deleteCompany(id: string, name: string) {
    if (!confirm(`למחוק את "${name}"? פעולה זו אינה הפיכה.`)) return
    setDeleting(id)
    try {
      await fetch(`/api/companies/${id}`, { method: 'DELETE' })
      setPipeline(prev => prev.filter(c => c.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="px-10 pt-8 pb-12">
      <Tooltip text="לקוחות פוטנציאליים">
        <h1 className="text-2xl font-bold text-gray-900 cursor-default">Potential Clients</h1>
      </Tooltip>
      <Tooltip text="לידים שנחקרים לפני ניקוד">
        <p className="text-sm text-gray-400 mt-1 cursor-default">Leads being actively researched before scoring</p>
      </Tooltip>

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
            <p className="text-xs mt-1 opacity-60">קדם עסקים מ-Prospect Research עם חץ ימינה</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pipeline.map(company => (
              <PipelineRow
                key={company.id}
                company={company}
                onDelete={deleteCompany}
                deleting={deleting === company.id}
                expanded={expanded.has(company.id)}
                onToggle={() => toggleExpand(company.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
