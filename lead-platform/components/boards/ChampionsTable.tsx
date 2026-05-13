'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Company } from '@/lib/types'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { StatusDot } from '@/components/ui/StatusDot'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatRelativeDate, cn } from '@/lib/utils'
import { useFetchState } from '@/components/providers/FetchStateProvider'
import type { FetchResult } from '@/components/providers/FetchStateProvider'
import {
  ExternalLink, Globe, ChevronDown, ChevronRight,
  Phone, Mail, User, Globe2, MessageCircle, Star,
  CalendarCheck, Image, CheckCircle2, XCircle,
  Search, Plus, Loader2, AlertCircle, Zap, Trash2, ArrowRight,
} from 'lucide-react'
import { useSelection } from '@/components/providers/SelectionProvider'
import { MoveToBoardMenu } from '@/components/ui/MoveToBoardMenu'

type Filter = 'all' | 'linkedin' | 'google_maps' | 'other'

const TABS: { value: Filter; label: string; hebrew: string }[] = [
  { value: 'all',         label: 'All',      hebrew: 'הכל'        },
  { value: 'linkedin',    label: 'LinkedIn', hebrew: 'לינקדאין'   },
  { value: 'google_maps', label: 'Maps',     hebrew: 'גוגל מפות' },
  { value: 'other',       label: 'Other',    hebrew: 'אחר'        },
]

// ─── Digital asset detection ──────────────────────────────────────────────────

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

function ExpandedRow({ company, colSpan }: { company: Company; colSpan: number }) {
  const assets  = detectAssets(company.notes ?? null, company.domain ?? null)
  const missing = assets.filter(a => !a.present)
  const present = assets.filter(a => a.present)

  return (
    <tr>
      <td colSpan={colSpan} className="px-0 pb-0">
        <div className="mx-0 mb-3 bg-gray-50 border border-gray-200 rounded-xl p-5 grid grid-cols-3 gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">למה נבחר</p>
            {company.notes
              ? <p className="text-sm text-gray-700 leading-relaxed" dir="rtl">{company.notes}</p>
              : <p className="text-sm text-gray-400 italic" dir="rtl">אין נתוני מחקר</p>}
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
                  <a href={company.domain.startsWith('http') ? company.domain : `https://${company.domain}`}
                    target="_blank" rel="noopener noreferrer"
                    className="hover:text-indigo-600 truncate flex items-center gap-1">
                    {company.domain.replace(/^https?:\/\//, '').split('/')[0]}
                    <ExternalLink size={10} />
                  </a>
                </div>
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
      </td>
    </tr>
  )
}

// ─── Fetch result card ────────────────────────────────────────────────────────

function ScoreChip({ score }: { score?: number }) {
  if (!score) return null
  const color = score <= 3 ? 'bg-red-100 text-red-600' : score <= 5 ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600'
  return <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', color)}>{score}/10</span>
}

function FetchResultCard({ biz }: { biz: FetchResult }) {
  const { addToDB, adding, added } = useFetchState()
  const isAdding = adding === biz.name
  const isAdded  = added.has(biz.name)
  return (
    <div className={cn(
      'border rounded-xl p-3.5 transition-all duration-300',
      isAdded ? 'opacity-40 scale-95 pointer-events-none border-gray-100 bg-gray-50'
              : 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow-sm'
    )}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{biz.name}</span>
            <ScoreChip score={biz.score} />
          </div>
          {biz.industry && (
            <p className="text-xs text-gray-400 mt-0.5">{biz.industry}{biz.city ? ` · ${biz.city}` : ''}</p>
          )}
        </div>
        <button
          onClick={() => addToDB(biz)}
          disabled={isAdding || isAdded}
          className={cn(
            'shrink-0 p-1.5 rounded-lg transition-colors',
            isAdded  ? 'bg-emerald-100 text-emerald-500 cursor-default'
            : isAdding ? 'bg-gray-100 text-gray-400 cursor-wait'
                       : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          )}
        >
          {isAdded ? <CheckCircle2 size={14} /> : isAdding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        </button>
      </div>
      {biz.weakness_summary && (
        <p className="text-[11px] text-gray-500 leading-relaxed mb-1.5">{biz.weakness_summary}</p>
      )}
      <div className="flex items-center gap-3 text-[11px] text-gray-400">
        {biz.domain && <span className="flex items-center gap-1"><Globe size={10} />{biz.domain.replace(/^https?:\/\//, '')}</span>}
        {biz.contact_phone && <span className="flex items-center gap-1"><Phone size={10} />{biz.contact_phone}</span>}
      </div>
    </div>
  )
}

// ─── Fetch bar (controls only) ────────────────────────────────────────────────

function FetchBar() {
  const { run, loading, autoMode } = useFetchState()
  const [query, setQuery] = useState('')

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && run('manual', query)}
        placeholder="שם עסק, תחום, מספר טלפון..."
        className="w-56 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-gray-300 text-right"
        dir="rtl"
      />
      <Tooltip text="חפש עסק לפי שאילתה">
        <button
          onClick={() => run('manual', query)}
          disabled={loading || !query.trim()}
          className={cn(
            'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
            loading || !query.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          )}
        >
          {loading && !autoMode ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
          Fetch New Business
        </button>
      </Tooltip>
      <Tooltip text="הפעל סוכן אוטונומי למצוא עסקים חדשים">
        <button
          onClick={() => run('auto')}
          disabled={loading}
          className={cn(
            'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
            loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'
          )}
        >
          {loading && autoMode ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
          Go
        </button>
      </Tooltip>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ChampionsTable({ companies }: { companies: Company[] }) {
  const [filter,   setFilter]   = useState<Filter>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [search,   setSearch]   = useState('')
  const [deleting,  setDeleting]  = useState<string | null>(null)
  const [promoting, setPromoting] = useState<string | null>(null)
  const [localRows, setLocalRows] = useState<Company[]>(companies)
  const { selected, toggle, selectAll, clear } = useSelection()
  const router  = useRouter()

  useEffect(() => { setLocalRows(companies) }, [companies])

  useEffect(() => {
    function onMoved(e: Event) {
      const ids = new Set((e as CustomEvent<{ ids: string[] }>).detail.ids)
      setLocalRows(prev => prev.filter(c => !ids.has(c.id)))
    }
    window.addEventListener('board-items-moved', onMoved)
    return () => window.removeEventListener('board-items-moved', onMoved)
  }, [])

  const fetch$  = useFetchState()

  async function promoteCompany(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setPromoting(id)
    try {
      await fetch(`/api/companies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Agent-Key': 'yoni-agent-key-2025' },
        body: JSON.stringify({ status: 'high_score' }),
      })
      setLocalRows(prev => prev.filter(c => c.id !== id))
    } finally {
      setPromoting(null)
    }
  }

  async function deleteCompany(id: string, name: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`למחוק את "${name}"? פעולה זו אינה הפיכה.`)) return
    setDeleting(id)
    try {
      await fetch(`/api/companies/${id}`, { method: 'DELETE' })
      setLocalRows(prev => prev.filter(c => c.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  function toggleExpand(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    toggle(id)
  }

  const bySource = filter === 'all' ? localRows : localRows.filter(c => c.source === filter)
  const rows = search.trim()
    ? bySource.filter(c => {
        const q     = search.toLowerCase().replace(/\D/g, '')
        const phone = (c.contact_phone ?? '').replace(/\D/g, '')
        return (
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.industry     ?? '').toLowerCase().includes(search.toLowerCase()) ||
          (c.contact_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
          (q.length >= 3 && phone.includes(q))
        )
      })
    : bySource

  return (
    <div className="px-10 pt-8 pb-12">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <Tooltip text="לוח אלופים">
            <h1 className="text-2xl font-bold text-gray-900 cursor-default">Champions Board</h1>
          </Tooltip>
          <Tooltip text="לידים מוסמכים מוכנים להמשיך בצנרת">
            <p className="text-sm text-gray-400 mt-1 cursor-default">Qualified leads ready to advance through the pipeline</p>
          </Tooltip>
        </div>
        <div className="shrink-0 pt-1">
          <FetchBar />
        </div>
      </div>

      {/* ── Full-width fetch results panel ── */}
      {fetch$.open && (
        <div className="mt-5 border border-indigo-100 rounded-2xl bg-indigo-50/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              {fetch$.loading
                ? 'סוכן פעיל'
                : fetch$.industry
                  ? `תוצאות: ${fetch$.industry}`
                  : `נמצאו ${fetch$.results.length} עסקים`}
            </p>
            <button onClick={() => fetch$.setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">סגור ✕</button>
          </div>

          {fetch$.loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-indigo-100 flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin text-indigo-500" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-indigo-700 transition-all duration-300">
                  {fetch$.statusMessage ?? 'מתחיל...'}
                </p>
                <p className="text-xs text-gray-400 mt-1">הסוכן עובד, זה יכול לקחת כמה שניות</p>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(step => (
                  <div
                    key={step}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-500',
                      fetch$.statusStep >= step
                        ? 'w-5 bg-indigo-400'
                        : 'w-1.5 bg-gray-200'
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {fetch$.error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />{fetch$.error}
            </div>
          )}

          {!fetch$.loading && fetch$.results.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {fetch$.results.map(biz => (
                <FetchResultCard key={biz.name} biz={biz} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Search + filter tabs ── */}
      <div className="flex items-center gap-3 mt-5">
        {/* Phone / name search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חפש לפי שם, תחום, טלפון..."
            className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-gray-300 w-52"
          />
        </div>

        <div className="flex items-center gap-1">
          {TABS.map(tab => {
            const count  = tab.value === 'all' ? localRows.length : localRows.filter(c => c.source === tab.value).length
            const active = filter === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                title={tab.hebrew}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                  active ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-800'
                )}
              >
                {tab.label}
                {active && count > 0 && <span className="ml-1.5 opacity-70 text-xs">{count}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-7 pb-3 pl-0 pr-1">
                <input
                  type="checkbox"
                  checked={rows.length > 0 && rows.every(c => selected.has(c.id))}
                  onChange={e => e.target.checked ? selectAll(rows.map(c => c.id)) : clear()}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-400"
                />
              </th>
              <th className="w-8 pb-3" />
              {([
                ['Company',  'חברה'],
                ['Industry', 'תעשייה'],
                ['Score',    'ציון'],
                ['Contact',  'איש קשר'],
                ['Added',    'נוסף'],
                ['Status',   'סטטוס'],
              ] as [string, string][]).map(([h, he]) => (
                <th key={h} className="text-left pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 first:pl-0">
                  <Tooltip text={he}><span className="cursor-default">{h}</span></Tooltip>
                </th>
              ))}
              <th className="w-8 pb-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-sm text-gray-400">
                  {search ? `אין תוצאות עבור "${search}"` : 'No leads match this filter'}
                </td>
              </tr>
            ) : rows.map((c, i) => {
              const isExpanded = expanded.has(c.id)
              const isLast     = i === rows.length - 1
              return (
                <>
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/boards/lead/${c.id}`)}
                    className={cn(
                      'group hover:bg-gray-50 transition-colors cursor-pointer',
                      !isExpanded && !isLast && 'border-b border-gray-100'
                    )}
                  >
                    <td className="py-3.5 pl-0 pr-1 w-7" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggle(c.id)}
                        onClick={e => e.stopPropagation()}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-400"
                      />
                    </td>
                    <td className="py-3.5 pr-1 pl-0 w-8">
                      <button
                        onClick={e => toggleExpand(c.id, e)}
                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </td>
                    <td className="py-3.5 pr-4 pl-0">
                      <span className="font-medium text-gray-900">{c.name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">{c.industry ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <ScoreBar score={c.score} />
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">
                      {c.contact_name ?? '—'}
                      {c.contact_phone && <span className="block text-gray-400">{c.contact_phone}</span>}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs text-gray-500">{formatRelativeDate(c.created_at)}</span>
                      {c.created_at && (
                        <span className="block text-[10px] text-gray-300 mt-0.5">
                          {new Date(c.created_at).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusDot status={c.status} />
                    </td>
                    <td className="py-3.5 pl-2 pr-0">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {c.linkedin_url && (
                          <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="p-1 rounded text-gray-300 hover:text-indigo-500 transition-colors">
                            <ExternalLink size={12} />
                          </a>
                        )}
                        {c.domain && (
                          <a href={c.domain.startsWith('http') ? c.domain : `https://${c.domain}`}
                            target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="p-1 rounded text-gray-300 hover:text-indigo-500 transition-colors">
                            <Globe size={12} />
                          </a>
                        )}
                        <button
                          onClick={e => promoteCompany(c.id, e)}
                          disabled={promoting === c.id}
                          className="p-1 rounded text-gray-300 hover:text-indigo-500 transition-colors disabled:opacity-40"
                          title="העבר ללקוחות פוטנציאליים"
                        >
                          {promoting === c.id
                            ? <Loader2 size={12} className="animate-spin" />
                            : <ArrowRight size={12} />}
                        </button>
                        <button
                          onClick={e => deleteCompany(c.id, c.name, e)}
                          disabled={deleting === c.id}
                          className="p-1 rounded text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40"
                          title="מחק ליד"
                        >
                          {deleting === c.id
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Trash2 size={12} />}
                        </button>
                        <MoveToBoardMenu
                          companyId={c.id}
                          currentStatus={c.status}
                          onMoved={() => setLocalRows(prev => prev.filter(r => r.id !== c.id))}
                        />
                      </div>
                    </td>
                  </tr>
                  {isExpanded && <ExpandedRow key={`${c.id}-exp`} company={c} colSpan={9} />}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
